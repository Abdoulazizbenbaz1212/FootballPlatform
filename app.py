from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    session
)

from flask_login import (
    LoginManager,
    login_user,
    logout_user,
    login_required,
    current_user
)

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from email_validator import validate_email, EmailNotValidError

import secrets
import string

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


# =========================================================
# PARRAINAGE
# =========================================================

def generate_referral_code():
    """
    Génère un code de parrainage unique.
    Exemple : FP7K2X9A
    """

    characters = string.ascii_uppercase + string.digits

    while True:
        code = "FP" + "".join(
            secrets.choice(characters)
            for _ in range(6)
        )

        existing = User.query.filter_by(
            referral_code=code
        ).first()

        if not existing:
            return code


def ensure_referral_code(user):
    """
    Donne un code aux anciens comptes qui n'en possèdent pas.
    """

    if not user.referral_code:
        user.referral_code = generate_referral_code()
        db.session.commit()


# =========================================================
# ACCUEIL
# =========================================================

@app.route("/")
def home():
    return render_template("index.html")


# =========================================================
# INSCRIPTION
# =========================================================

@app.route("/register", methods=["GET", "POST"])
def register():

    if current_user.is_authenticated:
        return redirect(url_for("profile"))

    # Si quelqu'un arrive avec ?ref=CODE
    if request.method == "GET":

        referral_code = request.args.get(
            "ref",
            ""
        ).strip().upper()

        if referral_code:
            session["referral_code"] = referral_code

    if request.method == "POST":

        username = request.form.get(
            "username",
            ""
        ).strip()

        email = request.form.get(
            "email",
            ""
        ).strip().lower()

        password = request.form.get(
            "password",
            ""
        )

        # -------------------------
        # Validation pseudo
        # -------------------------

        if len(username) < 3 or len(username) > 30:
            flash(
                "Le pseudo doit contenir entre 3 et 30 caractères."
            )
            return redirect(url_for("register"))

        # -------------------------
        # Validation mot de passe
        # -------------------------

        if len(password) < 8:
            flash(
                "Le mot de passe doit contenir au moins 8 caractères."
            )
            return redirect(url_for("register"))

        # -------------------------
        # Validation email
        # -------------------------

        try:
            validate_email(email, check_deliverability=False)

        except EmailNotValidError:
            flash("Adresse email invalide.")
            return redirect(url_for("register"))

        # -------------------------
        # Vérification pseudo
        # -------------------------

        if User.query.filter_by(
            username=username
        ).first():

            flash("Ce pseudo est déjà utilisé.")
            return redirect(url_for("register"))

        # -------------------------
        # Vérification email
        # -------------------------

        if User.query.filter_by(
            email=email
        ).first():

            flash(
                "Cette adresse email est déjà utilisée."
            )
            return redirect(url_for("register"))

        # -------------------------
        # Recherche du parrain
        # -------------------------

        referral_code = session.get(
            "referral_code"
        )

        referrer = None

        if referral_code:

            referrer = User.query.filter_by(
                referral_code=referral_code
            ).first()

        # -------------------------
        # Création du compte
        # -------------------------

        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(
                password
            ),
            referral_code=generate_referral_code(),
            referred_by_id=(
                referrer.id
                if referrer
                else None
            ),
            referral_points=0
        )

        db.session.add(user)

        # On valide d'abord le nouveau compte
        db.session.flush()

        # -------------------------
        # Récompense du parrain
        # -------------------------

        if referrer and referrer.id != user.id:

            referrer.points += 100
            referrer.referral_points += 100

        db.session.commit()

        # Le code de parrainage ne doit
        # plus rester en session
        session.pop(
            "referral_code",
            None
        )

        login_user(user)

        return redirect(
            url_for("profile")
        )

    return render_template(
        "register.html"
    )


# =========================================================
# CONNEXION
# =========================================================

@app.route("/login", methods=["GET", "POST"])
def login():

    if current_user.is_authenticated:
        return redirect(
            url_for("profile")
        )

    if request.method == "POST":

        email = request.form.get(
            "email",
            ""
        ).strip().lower()

        password = request.form.get(
            "password",
            ""
        )

        user = User.query.filter_by(
            email=email
        ).first()

        if user and check_password_hash(
            user.password_hash,
            password
        ):

            # Donne un code aux anciens comptes
            ensure_referral_code(user)

            login_user(user)

            return redirect(
                url_for("profile")
            )

        flash(
            "Email ou mot de passe incorrect."
        )

    return render_template(
        "login.html"
    )


# =========================================================
# DÉCONNEXION
# =========================================================

@app.route("/logout")
@login_required
def logout():

    logout_user()

    return redirect(
        url_for("home")
    )


# =========================================================
# PROFIL
# =========================================================

@app.route("/profile")
@login_required
def profile():

    ensure_referral_code(current_user)

    referral_count = User.query.filter_by(
        referred_by_id=current_user.id
    ).count()

    referral_link = url_for(
        "register",
        ref=current_user.referral_code,
        _external=True
    )

    return render_template(
        "profile.html",
        user=current_user,
        referral_count=referral_count,
        referral_link=referral_link
    )


# =========================================================
# LANCEMENT
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
