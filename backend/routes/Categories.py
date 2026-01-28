from flask import Blueprint, jsonify
from db_objects import Categories


bp = Blueprint('categories', __name__, url_prefix='/api')

@bp.route('/get_all_categories', methods=['GET'])
def get_all_categories():
    """
    @brief Returns a list of all categories.

    @return list: A list of dictionaries where each dictionary contains the id and name of a category.
    """
    categories = Categories.query.all()
    results = []
    for category in categories:
        results.append({
            "id_category": category.id_category,
            "category_name": category.category_name
        })
    return jsonify(results), 200