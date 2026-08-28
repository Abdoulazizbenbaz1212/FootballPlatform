from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin


db = SQLAlchemy()


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(30), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)

    password_hash = db.Column(db.String(255), nullable=False)

    profile_photo = db.Column(db.String(500), nullable=True)
    bio = db.Column(db.String(500), default="")

    points = db.Column(db.Integer, default=0, nullable=False)
    level = db.Column(db.String(30), default="Débutant", nullable=False)

    # Parrainage
    referral_code = db.Column(
        db.String(20),
        unique=True,
        nullable=True
    )

    referred_by_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=True
    )

    referral_points = db.Column(
        db.Integer,
        default=0,
        nullable=False
    )

    # Authentification à deux facteurs
    two_factor_enabled = db.Column(
        db.Boolean,
        default=False,
        nullable=False
    )

    two_factor_secret = db.Column(
        db.String(64),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    referred_users = db.relationship(
        "User",
        backref=db.backref("referrer", remote_side=[id]),
        foreign_keys=[referred_by_id]
    )
