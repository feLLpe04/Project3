from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from flask_cors import CORS
import os
from flask import render_template


#################################################
# Flask Setup
#################################################

app = Flask(__name__)
CORS(app)  # Enable CORS to allow cross-origin requests

# Configure the database connection
#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mortality_data.db'  # Database URI
#app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#db = SQLAlchemy(app)
# Dynamically set the database path to be in the same directory as the app
base_dir = os.path.abspath(os.path.dirname(__file__))  # Get the directory of the app
db_path = os.path.join(base_dir, 'mortality_data.db')  # Construct the full path to the database

# Configure the database connection
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'  # Use the constructed path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)



# Define a model for the mortality data
class MortalityData(db.Model):
    __tablename__ = 'mortality_data'
    Country_code = db.Column(db.Integer, primary_key=True)
    Country_name = db.Column(db.String)
    ISO_Alpha3 = db.Column(db.String)
    Year = db.Column(db.Integer)
    Cause = db.Column(db.String)
    Sex = db.Column(db.Integer)
    Total_deaths = db.Column(db.Float)

#################################################
# Flask Routes
#################################################

@app.route('/')
def home():
    """List all available API routes."""
    """Serve the index.html file."""
    return (
        f"Welcome to the Cause-Mortality API.<br/>"
        f"Available endpoints:<br/>"
        f"/api/mortality<br/>"
        f"Use query parameters 'cause_group' and 'year' to filter data.<br/>"
        f"Example: /api/mortality?cause_group=A&year=2020"
    )

@app.route('/api/mortality', methods=['GET'])
def get_mortality_data():
    # Query parameters
    cause_group = request.args.get('cause_group')
    year = request.args.get('year', type=int)

    # Query the database
    query = db.session.query(MortalityData)
    if cause_group:
        query = query.filter(MortalityData.Cause.like(f'{cause_group}%'))
    if year:
        query = query.filter(MortalityData.Year == year)

    results = query.all()

    # Convert results to a list of dictionaries
    data = [
        {
            'Country_code': row.Country_code,
            'Country_name': row.Country_name,
            'ISO_Alpha3': row.ISO_Alpha3,
            'Year': row.Year,
            'Cause': row.Cause,
            'Sex': row.Sex,
            'Total_deaths': row.Total_deaths,
        }
        for row in results
    ]

    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
