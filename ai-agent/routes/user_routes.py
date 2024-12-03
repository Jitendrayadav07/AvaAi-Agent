from flask import Blueprint, jsonify, request

user_routes = Blueprint('user_routes', __name__)

@user_routes.route('/register', methods=['POST'])
def register():
    # Registration logic here
    return jsonify(message="User registered successfully")

@user_routes.route('/login', methods=['POST'])
def login():
    # Authentication logic here
    return jsonify(message="User logged in successfully")

