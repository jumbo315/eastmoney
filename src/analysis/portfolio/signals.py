"""
AI Smart Signals Generator

Generates intelligent trading signals for portfolio positions:
- Opportunity signals (buy candidates)
- Risk signals (warning/sell candidates)
- Neutral signals (hold)

Signals are based on:
- Technical indicators (MA crossovers, RSI)
- Valuation metrics
- Fund flow data
- Sentiment analysis
- Correlation/concentration risks
"""

import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum
from dataclasses import dataclass


class SignalType(Enum):
    """Signal types for positions."""
    OPPORTUNITY = "opportunity"  # Green - buy opportunity
    RISK = "risk"  # Red - risk warning
    NEUTRAL = "neutral"  # Gray - no strong signal


class SignalReason(Enum):
    """Reasons for signal generation."""
    # Opportunity reasons
    VALUATION_LOW = "valuation_low"
    FUND_INFLOW = "fund_inflow"
    SENTIMENT_POSITIVE = "sentiment_positive"
    OVERSOLD = "oversold"
    MA_BULLISH_CROSS = "ma_bullish_cross"
    EARNINGS_BEAT = "earnings_beat"

    # Risk reasons
    VALUATION_HIGH = "valuation_high"
    FUND_OUTFLOW = "fund_outflow"
    SENTIMENT_NEGATIVE = "sentiment_negative"
    OVERBOUGHT = "overbought"
    MA_BEARISH_CROSS = "ma_bearish_cross"
    EARNINGS_MISS = "earnings_miss"
    BELOW_MA20 = "below_ma20"
    HIGH_CORRELATION = "high_correlation"
    CONCENTRATION_RISK = "concentration_risk"
    NEWS_NEGATIVE = "news_negative"


@dataclass
class Signal:
    """Represents a trading signal for a position."""
    signal_type: SignalType
    strength: float  # 0-1, higher = stronger signal
    reasons: List[SignalReason]
    details: Dict[str, Any]


class SignalGenerator:
    """
    Generates AI-powered smart signals for portfolio positions.
    """

    def __init__(self):
        self.opportunity_threshold = 0.6
        self.risk_threshold = 0.6

    def generate_signals(
        self,
        positions: List[Dict],
        price_histories: Dict[str, List[Dict]],
        fund_flows: Dict[str, Dict] = None,
        sentiments: Dict[str, float] = None,
        correlations: Dict[str, Dict[str, float]] = None,
        news_events: Dict[str, List[Dict]] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate signals for all positions.

        Args:
            positions: List of positions
            price_histories: Price history for each asset
            fund_flows: Fund flow data (net inflow/outflow)
            sentiments: Sentiment scores (0-100)
            correlations: Correlation data between positions
            news_events: Recent news events

        Returns:
            List of signals for each position
        """
        signals = []

        for pos in positions:
            code = pos.get("asset_code")
            name = pos.get("asset_name", code)

            signal = self._analyze_position(
                pos,
                price_histories.get(code, []),
                fund_flows.get(code) if fund_flows else None,
                sentiments.get(code) if sentiments else None,
                correlations.get(code) if correlations else None,
                news_events.get(code) if news_events else None,
                positions  # For concentration analysis
            )

            signals.append({
                "code": code,
                "name": name,
                "signal_type": signal.signal_type.value,
                "strength": round(signal.strength, 2),
                "reasons": [r.value for r in signal.reasons],
                "details": signal.details,
                "summary": self._generate_summary(signal, name),
                "action_suggestion": self._generate_action(signal)
            })

        return signals

    def get_signal_detail(
        self,
        position: Dict,
        price_history: List[Dict],
        fund_flow: Dict = None,
        sentiment: float = None,
        correlation_data: Dict = None,
        news_events: List[Dict] = None,
        all_positions: List[Dict] = None
    ) -> Dict[str, Any]:
        """
        Get detailed signal analysis for a single position.

        Returns comprehensive analysis with reasoning.
        """
        signal = self._analyze_position(
            position,
            price_history,
            fund_flow,
            sentiment,
            correlation_data,
            news_events,
            all_positions
        )

        code = position.get("asset_code")
        name = position.get("asset_name", code)

        # Generate detailed explanation
        explanation = self._generate_detailed_explanation(signal, name)

        return {
            "code": code,
            "name": name,
            "signal_type": signal.signal_type.value,
            "strength": round(signal.strength, 2),
            "reasons": [r.value for r in signal.reasons],
            "details": signal.details,
            "summary": self._generate_summary(signal, name),
            "explanation": explanation,
            "action_suggestion": self._generate_action(signal),
            "confidence": self._calculate_confidence(signal),
            "factors": self._get_factor_breakdown(signal),
            "generated_at": datetime.now().isoformat()
        }

    def _analyze_position(
        self,
        position: Dict,
        price_history: List[Dict],
        fund_flow: Dict,
        sentiment: float,
        correlation_data: Dict,
        news_events: List[Dict],
        all_positions: List[Dict]
    ) -> Signal:
        """
        Analyze a single position and generate signal.
        """
        opportunity_score = 0
        risk_score = 0
        reasons = []
        details = {}

        # Technical Analysis
        if price_history and len(price_history) >= 20:
            tech_signal = self._analyze_technicals(price_history)
            details["technical"] = tech_signal

            if tech_signal.get("signal") == "bullish":
                opportunity_score += 0.3
                if tech_signal.get("ma_cross") == "golden":
                    reasons.append(SignalReason.MA_BULLISH_CROSS)
                if tech_signal.get("rsi_signal") == "oversold":
                    reasons.append(SignalReason.OVERSOLD)

            elif tech_signal.get("signal") == "bearish":
                risk_score += 0.3
                if tech_signal.get("ma_cross") == "death":
                    reasons.append(SignalReason.MA_BEARISH_CROSS)
                if tech_signal.get("rsi_signal") == "overbought":
                    reasons.append(SignalReason.OVERBOUGHT)
                if tech_signal.get("below_ma20"):
                    reasons.append(SignalReason.BELOW_MA20)

        # Fund Flow Analysis
        if fund_flow:
            details["fund_flow"] = fund_flow
            net_flow = fund_flow.get("net_flow", 0)
            flow_trend = fund_flow.get("trend", "neutral")

            if net_flow > 0 and flow_trend == "positive":
                opportunity_score += 0.25
                reasons.append(SignalReason.FUND_INFLOW)
            elif net_flow < 0 and flow_trend == "negative":
                risk_score += 0.25
                reasons.append(SignalReason.FUND_OUTFLOW)

        # Sentiment Analysis
        if sentiment is not None:
            details["sentiment"] = sentiment
            if sentiment >= 70:
                opportunity_score += 0.2
                reasons.append(SignalReason.SENTIMENT_POSITIVE)
            elif sentiment <= 30:
                risk_score += 0.2
                reasons.append(SignalReason.SENTIMENT_NEGATIVE)

        # Correlation/Concentration Risk
        if all_positions:
            conc_risk = self._analyze_concentration(position, all_positions)
            details["concentration"] = conc_risk

            if conc_risk.get("is_concentrated"):
                risk_score += 0.15
                reasons.append(SignalReason.CONCENTRATION_RISK)

        if correlation_data:
            corr_risk = self._analyze_correlation_risk(correlation_data)
            details["correlation_risk"] = corr_risk

            if corr_risk.get("has_high_correlation"):
                risk_score += 0.15
                reasons.append(SignalReason.HIGH_CORRELATION)

        # News Events
        if news_events:
            news_signal = self._analyze_news(news_events)
            details["news"] = news_signal

            if news_signal.get("sentiment") == "negative":
                risk_score += 0.2
                reasons.append(SignalReason.NEWS_NEGATIVE)
            elif news_signal.get("sentiment") == "positive":
                opportunity_score += 0.15

        # Determine final signal
        if opportunity_score >= self.opportunity_threshold and opportunity_score > risk_score:
            return Signal(
                signal_type=SignalType.OPPORTUNITY,
                strength=min(1.0, opportunity_score),
                reasons=reasons,
                details=details
            )
        elif risk_score >= self.risk_threshold and risk_score > opportunity_score:
            return Signal(
                signal_type=SignalType.RISK,
                strength=min(1.0, risk_score),
                reasons=reasons,
                details=details
            )
        else:
            return Signal(
                signal_type=SignalType.NEUTRAL,
                strength=0.5,
                reasons=reasons,
                details=details
            )

    def _analyze_technicals(self, price_history: List[Dict]) -> Dict:
        """Analyze technical indicators."""
        prices = []
        for h in sorted(price_history, key=lambda x: x.get("date", "")):
            price = h.get("price") or h.get("close") or h.get("value")
            if price:
                prices.append(float(price))

        if len(prices) < 20:
            return {"signal": "neutral", "insufficient_data": True}

        prices = np.array(prices)
        current_price = prices[-1]

        # Calculate MAs
        ma5 = np.mean(prices[-5:])
        ma10 = np.mean(prices[-10:])
        ma20 = np.mean(prices[-20:])

        # Determine MA cross
        ma_cross = None
        if ma5 > ma10 > ma20:
            ma_cross = "golden"
        elif ma5 < ma10 < ma20:
            ma_cross = "death"

        # Calculate RSI
        rsi = self._calculate_rsi(prices)
        rsi_signal = "neutral"
        if rsi < 30:
            rsi_signal = "oversold"
        elif rsi > 70:
            rsi_signal = "overbought"

        # Determine overall technical signal
        below_ma20 = current_price < ma20

        if ma_cross == "golden" or rsi_signal == "oversold":
            signal = "bullish"
        elif ma_cross == "death" or rsi_signal == "overbought" or below_ma20:
            signal = "bearish"
        else:
            signal = "neutral"

        return {
            "signal": signal,
            "ma5": round(ma5, 3),
            "ma10": round(ma10, 3),
            "ma20": round(ma20, 3),
            "current_price": round(current_price, 3),
            "ma_cross": ma_cross,
            "rsi": round(rsi, 1),
            "rsi_signal": rsi_signal,
            "below_ma20": below_ma20
        }

    def _calculate_rsi(self, prices: np.ndarray, period: int = 14) -> float:
        """Calculate RSI indicator."""
        if len(prices) < period + 1:
            return 50  # Neutral

        deltas = np.diff(prices)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)

        avg_gain = np.mean(gains[-period:])
        avg_loss = np.mean(losses[-period:])

        if avg_loss == 0:
            return 100

        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))

        return rsi

    def _analyze_concentration(
        self,
        position: Dict,
        all_positions: List[Dict]
    ) -> Dict:
        """Analyze position concentration risk."""
        total_value = sum(
            float(p.get("current_value") or p.get("total_cost", 0))
            for p in all_positions
        )

        pos_value = float(
            position.get("current_value") or position.get("total_cost", 0)
        )

        weight = (pos_value / total_value * 100) if total_value > 0 else 0

        return {
            "weight": round(weight, 2),
            "is_concentrated": weight > 20,
            "threshold": 20,
            "message": f"占比 {weight:.1f}%" + (" (超过20%警戒线)" if weight > 20 else "")
        }

    def _analyze_correlation_risk(self, correlation_data: Dict) -> Dict:
        """Analyze correlation-related risks."""
        high_corr_pairs = []

        for other_code, corr in correlation_data.items():
            if isinstance(corr, (int, float)) and corr > 0.7:
                high_corr_pairs.append({
                    "code": other_code,
                    "correlation": round(corr, 2)
                })

        return {
            "has_high_correlation": len(high_corr_pairs) > 0,
            "high_correlation_pairs": high_corr_pairs[:3],  # Top 3
            "message": f"与 {len(high_corr_pairs)} 只持仓高度相关" if high_corr_pairs else "相关性正常"
        }

    def _analyze_news(self, news_events: List[Dict]) -> Dict:
        """Analyze recent news sentiment."""
        if not news_events:
            return {"sentiment": "neutral", "count": 0}

        # Simple sentiment analysis based on keywords
        negative_keywords = ["下跌", "亏损", "风险", "警告", "调查", "处罚", "违规", "减持", "暴跌"]
        positive_keywords = ["上涨", "盈利", "增长", "突破", "创新", "增持", "利好", "涨停"]

        positive_count = 0
        negative_count = 0

        for event in news_events[:10]:  # Recent 10 events
            title = event.get("title", "")
            for kw in negative_keywords:
                if kw in title:
                    negative_count += 1
                    break
            for kw in positive_keywords:
                if kw in title:
                    positive_count += 1
                    break

        if negative_count > positive_count * 2:
            sentiment = "negative"
        elif positive_count > negative_count * 2:
            sentiment = "positive"
        else:
            sentiment = "neutral"

        return {
            "sentiment": sentiment,
            "positive_count": positive_count,
            "negative_count": negative_count,
            "total_count": len(news_events),
            "recent_headlines": [e.get("title", "") for e in news_events[:3]]
        }

    def _generate_summary(self, signal: Signal, name: str) -> str:
        """Generate a brief summary of the signal."""
        if signal.signal_type == SignalType.OPPORTUNITY:
            return f"{name} 存在买入机会"
        elif signal.signal_type == SignalType.RISK:
            return f"{name} 存在风险信号"
        else:
            return f"{name} 暂无明显信号"

    def _generate_action(self, signal: Signal) -> str:
        """Generate action suggestion."""
        if signal.signal_type == SignalType.OPPORTUNITY:
            if signal.strength >= 0.8:
                return "强烈建议关注，可考虑加仓"
            else:
                return "建议关注，等待更多确认信号"

        elif signal.signal_type == SignalType.RISK:
            if signal.strength >= 0.8:
                return "建议减仓或设置止损"
            else:
                return "建议密切关注，控制仓位"

        else:
            return "继续持有，保持观察"

    def _generate_detailed_explanation(self, signal: Signal, name: str) -> str:
        """Generate detailed explanation for signal."""
        explanations = []

        if signal.signal_type == SignalType.OPPORTUNITY:
            explanations.append(f"【机会信号】{name} 当前存在以下积极因素：")
        elif signal.signal_type == SignalType.RISK:
            explanations.append(f"【风险信号】{name} 当前存在以下风险因素：")
        else:
            explanations.append(f"【中性信号】{name} 当前没有明显的买入或卖出信号。")

        # Add reason-specific explanations
        reason_explanations = {
            SignalReason.MA_BULLISH_CROSS: "短期均线上穿长期均线，形成金叉，技术面看涨",
            SignalReason.MA_BEARISH_CROSS: "短期均线下穿长期均线，形成死叉，技术面看跌",
            SignalReason.OVERSOLD: "RSI指标显示超卖，可能存在反弹机会",
            SignalReason.OVERBOUGHT: "RSI指标显示超买，短期可能回调",
            SignalReason.BELOW_MA20: "股价跌破20日均线，短期走势偏弱",
            SignalReason.FUND_INFLOW: "近期主力资金持续净流入，市场关注度提升",
            SignalReason.FUND_OUTFLOW: "近期主力资金持续净流出，需警惕下跌风险",
            SignalReason.SENTIMENT_POSITIVE: "市场情绪积极，投资者信心较高",
            SignalReason.SENTIMENT_NEGATIVE: "市场情绪消极，投资者信心不足",
            SignalReason.HIGH_CORRELATION: "与其他持仓高度相关，分散风险效果有限",
            SignalReason.CONCENTRATION_RISK: "持仓占比过高，存在集中风险",
            SignalReason.NEWS_NEGATIVE: "近期有负面新闻，需关注基本面变化",
        }

        for reason in signal.reasons:
            if reason in reason_explanations:
                explanations.append(f"• {reason_explanations[reason]}")

        return "\n".join(explanations)

    def _calculate_confidence(self, signal: Signal) -> str:
        """Calculate confidence level of the signal."""
        num_reasons = len(signal.reasons)

        if num_reasons >= 3 and signal.strength >= 0.7:
            return "high"
        elif num_reasons >= 2 or signal.strength >= 0.6:
            return "medium"
        else:
            return "low"

    def _get_factor_breakdown(self, signal: Signal) -> List[Dict]:
        """Get breakdown of factors contributing to the signal."""
        factors = []

        # Technical factor
        tech = signal.details.get("technical", {})
        if tech:
            factors.append({
                "name": "技术分析",
                "signal": tech.get("signal", "neutral"),
                "weight": 0.3,
                "details": f"RSI: {tech.get('rsi', 'N/A')}, MA20: {tech.get('ma20', 'N/A')}"
            })

        # Fund flow factor
        flow = signal.details.get("fund_flow", {})
        if flow:
            factors.append({
                "name": "资金流向",
                "signal": flow.get("trend", "neutral"),
                "weight": 0.25,
                "details": f"净流入: {flow.get('net_flow', 0)}"
            })

        # Sentiment factor
        sentiment = signal.details.get("sentiment")
        if sentiment is not None:
            s_signal = "positive" if sentiment >= 60 else ("negative" if sentiment <= 40 else "neutral")
            factors.append({
                "name": "市场情绪",
                "signal": s_signal,
                "weight": 0.2,
                "details": f"情绪指数: {sentiment}"
            })

        # Concentration factor
        conc = signal.details.get("concentration", {})
        if conc:
            factors.append({
                "name": "集中度风险",
                "signal": "risk" if conc.get("is_concentrated") else "ok",
                "weight": 0.15,
                "details": conc.get("message", "")
            })

        return factors
