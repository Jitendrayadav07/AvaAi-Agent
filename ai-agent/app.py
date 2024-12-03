from flask import Flask

from routes.user_routes import user_routes
from routes.crewai_routes import crewai_routes

from flask_cors import CORS

app = Flask(__name__)
CORS(app)


# Register routes
app.register_blueprint(user_routes, url_prefix="/users")
app.register_blueprint(crewai_routes, url_prefix="/crew")


if __name__ == '__main__':
    app.run(debug=True)
