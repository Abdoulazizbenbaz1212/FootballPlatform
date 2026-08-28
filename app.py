from flask import Flask, render_template, request, redirect, url_for, flash
from flask_login import (
    LoginManager,
    login_user,
    logout_user,
    login_required,
    current_user
)
from werkzeug.security import generate_password_hash, check_password_hash
from email_validator import validate_email, EmailNotValidError

from models import db, User


app = Flask(__name__)

app.config["SECRET_KEY"] = "change-this-secret-key-before-production"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///football.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


with app.app_context():
    db.create_all()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/register", methods=["GET", "POST"])
def register():

    if current_user.is_authenticated:
        return redirect(url_for("profile"))

    if request.method == "POST":

        username = request.form.get("username", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        if len(username) < 3 or len(username) > 30:
            flash("Le pseudo doit contenir entre 3 et 30 caractères.")
            return redirect(url_for("register"))

        if len(password) < 8:
            flash("Le mot de passe doit contenir au moins 8 caractères.")
            return redirect(url_for("register"))

        try:
            validate_email(email)
        except EmailNotValidError:
            flash("Adresse email invalide.")
            return redirect(url_for("register"))

        if User.query.filter_by(username=username).first():
            flash("Ce pseudo est déjà utilisé.")
            return redirect(url_for("register"))

        if User.query.filter_by(email=email).first():
            flash("Cette adresse email est déjà utilisée.")
            return redirect(url_for("register"))

        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )

        db.session.add(user)
        db.session.commit()

        login_user(user)

        return redirect(url_for("profile"))

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():

    if current_user.is_authenticated:
        return redirect(url_for("profile"))

    if request.method == "POST":

        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password_hash, password):

            login_user(user)

            return redirect(url_for("profile"))

        flash("Email ou mot de passe incorrect.")

    return render_template("login.html")


@app.route("/logout")
@login_required
def logout():

    logout_user()

    return redirect(url_for("home"))


@app.route("/profile")
@login_required
def profile():

    return render_template("profile.html", user=current_user)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
