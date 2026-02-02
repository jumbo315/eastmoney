"""
AI Recommendation System - 智能投资推荐系统

Quantitative factor-based stock and fund recommendation engine.
Key principles:
- Quantitative models select, LLM explains
- Predict breakouts, don't chase rallies
- Quality and risk-adjusted returns over raw performance
"""
from .engine import RecommendationEngine, get_recommendations

# Backward compatibility aliases
RecommendationEngineV2 = RecommendationEngine
get_v2_recommendations = get_recommendations

__all__ = ['RecommendationEngine', 'get_recommendations', 'RecommendationEngineV2', 'get_v2_recommendations']
