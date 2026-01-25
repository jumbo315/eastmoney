"""
Stock AI Diagnosis Prompt Templates

This module contains prompt templates for AI-powered stock analysis features:
1. Comprehensive Investment Diagnosis Report
2. Technical Signal Interpretation
"""

STOCK_DIAGNOSIS_SYSTEM_PROMPT = """
你是一位专业的投资分析师，具有丰富的A股市场分析经验。
你的职责是根据提供的多维度数据，为投资者提供专业、客观的投资诊断报告。
请用中文回答，输出格式必须是严格的JSON。
"""

STOCK_DIAGNOSIS_PROMPT = """
请基于以下多维度数据对股票进行综合诊断分析。

【股票基本信息】
股票代码: {stock_code}
股票名称: {stock_name}
当前价格: {current_price}
今日涨跌幅: {change_pct}%
所属行业: {industry}

【财务健康数据】
- 财务健康评分: {health_score}/25
- ROE: {roe}% {roe_analysis}
- 净利率: {net_margin}%
- 资产负债率: {debt_ratio}%
- 流动比率: {current_ratio}
- 毛利率: {gross_margin}%

【股东结构数据】
- 筹码集中度变化: {concentration_change}
- 最新股东人数变化趋势: {holder_trend}

【杠杆资金数据】
- 融资余额: {financing_balance}亿
- 融资5日变化: {financing_5d_change}%
- 市场情绪判断: {leverage_sentiment}

【事件日历】
近期重要事件:
{upcoming_events}

【量化信号】
- MACD信号: {macd_signal}
- KDJ信号: {kdj_signal}
- RSI信号: {rsi_signal} (RSI值: {rsi_value})
- 布林带信号: {boll_signal}
- 综合技术信号: {overall_signal}，强度: {signal_strength}

请输出以下JSON格式的诊断报告（注意：只输出JSON，不要输出其他内容）：
{{
  "score": <0-100的综合评分整数>,
  "rating": "<优秀/良好/中等/较差>",
  "recommendation": "<强烈买入/买入/谨慎持有/减持/卖出>",
  "highlights": ["<亮点1>", "<亮点2>", "<亮点3>"],
  "risks": ["<风险点1>", "<风险点2>"],
  "action_advice": "<50-100字的具体操作建议>",
  "key_focus": "<近期重点关注事项，20-40字>"
}}

评分标准参考：
- 90-100: 优秀，财务健康+技术面看多+无重大风险
- 70-89: 良好，大部分指标正常
- 50-69: 中等，存在一些问题需关注
- 30-49: 较差，存在较多问题
- 0-29: 很差，建议回避
"""

QUANT_SIGNAL_INTERPRETATION_PROMPT = """
请用通俗易懂的语言解读以下技术指标，并给出具体的操作建议。

【股票信息】
股票代码: {stock_code}
当前价格: {current_price}

【技术指标详情】
- MACD: DIF={macd_dif}, DEA={macd_dea}, 柱状值={macd_value}
  信号判定: {macd_signal}

- KDJ: K={kdj_k}, D={kdj_d}, J={kdj_j}
  信号判定: {kdj_signal}

- RSI(6): {rsi_value}
  信号判定: {rsi_signal}

- 布林带: 上轨={boll_upper}, 中轨={boll_mid}, 下轨={boll_lower}
  当前价位: {current_price}
  信号判定: {boll_signal}

- 综合信号方向: {overall_direction}
- 综合信号强度: {overall_strength}
- 综合评分: {overall_score}

请用中文输出以下JSON格式（注意：只输出JSON，不要输出其他内容）：
{{
  "pattern": "<当前技术形态的一句话描述，如'震荡偏多'、'下跌趋势'等>",
  "interpretation": "<80-150字的通俗解读，解释当前各指标的含义和市场状态>",
  "action": "<50-80字的具体操作建议，包含可能的买卖点位参考>"
}}
"""


def build_diagnosis_prompt(
    stock_code: str,
    stock_name: str,
    current_price: float,
    change_pct: float,
    industry: str,
    financials: dict,
    shareholders: dict,
    margin: dict,
    events: dict,
    quant: dict
) -> str:
    """
    Build the diagnosis prompt with all available data.

    Args:
        stock_code: Stock code (e.g., "000001")
        stock_name: Stock name (e.g., "平安银行")
        current_price: Current stock price
        change_pct: Today's change percentage
        industry: Stock industry/sector
        financials: Financial health data from /stocks/{code}/financials
        shareholders: Shareholder data from /stocks/{code}/shareholders
        margin: Margin data from /stocks/{code}/margin
        events: Event data from /stocks/{code}/events
        quant: Quant signal data from /stocks/{code}/quant

    Returns:
        Formatted prompt string
    """
    # Extract financial data
    summary = financials.get("summary", {})
    health_score = financials.get("health_score", "N/A")
    roe = summary.get("roe", "N/A")
    net_margin = summary.get("netprofit_margin", "N/A")
    debt_ratio = summary.get("debt_to_assets", "N/A")
    current_ratio = summary.get("current_ratio", "N/A")
    gross_margin = summary.get("grossprofit_margin", "N/A")

    # ROE trend analysis
    roe_analysis = ""
    if roe and roe != "N/A":
        if roe > 15:
            roe_analysis = "(高于15%，表现优秀)"
        elif roe > 10:
            roe_analysis = "(表现良好)"
        elif roe > 5:
            roe_analysis = "(一般)"
        else:
            roe_analysis = "(偏低)"

    # Extract shareholder data
    concentration = shareholders.get("concentration_change", {})
    concentration_change = "N/A"
    holder_trend = "N/A"
    if concentration:
        change_val = concentration.get("value", 0)
        trend = concentration.get("trend", "")
        signal = concentration.get("signal", "")
        concentration_change = f"{change_val}% ({trend})"
        if trend == "decreasing":
            holder_trend = "股东人数减少，筹码趋于集中"
        else:
            holder_trend = "股东人数增加，筹码趋于分散"

    # Extract margin data
    margin_summary = margin.get("summary", {})
    sentiment = margin.get("sentiment", {})
    rzye = margin_summary.get("rzye")
    financing_balance = round(rzye / 100000000, 2) if rzye else "N/A"
    financing_5d_change = margin_summary.get("rzye_5d_change", "N/A")
    leverage_sentiment = sentiment.get("description", "N/A") if sentiment else "N/A"

    # Extract events
    upcoming = events.get("upcoming_events", [])
    events_text = ""
    if upcoming:
        for event in upcoming[:3]:
            events_text += f"- [{event.get('date', '')}] {event.get('title', '')}: {event.get('detail', '')}\n"
    else:
        events_text = "- 暂无近期重大事件"

    # Extract quant signals
    signals = quant.get("signals", {})
    overall = quant.get("overall_signal", {})

    macd = signals.get("macd", {})
    kdj = signals.get("kdj", {})
    rsi = signals.get("rsi", {})
    boll = signals.get("boll", {})

    return STOCK_DIAGNOSIS_PROMPT.format(
        stock_code=stock_code,
        stock_name=stock_name,
        current_price=current_price if current_price else "N/A",
        change_pct=change_pct if change_pct is not None else "N/A",
        industry=industry or "N/A",
        health_score=health_score if health_score else "N/A",
        roe=roe if roe else "N/A",
        roe_analysis=roe_analysis,
        net_margin=net_margin if net_margin else "N/A",
        debt_ratio=debt_ratio if debt_ratio else "N/A",
        current_ratio=current_ratio if current_ratio else "N/A",
        gross_margin=gross_margin if gross_margin else "N/A",
        concentration_change=concentration_change,
        holder_trend=holder_trend,
        financing_balance=financing_balance,
        financing_5d_change=financing_5d_change if financing_5d_change != "N/A" else "N/A",
        leverage_sentiment=leverage_sentiment,
        upcoming_events=events_text,
        macd_signal=macd.get("signal", "N/A"),
        kdj_signal=kdj.get("signal", "N/A"),
        rsi_signal=rsi.get("signal", "N/A"),
        rsi_value=rsi.get("value", "N/A"),
        boll_signal=boll.get("signal", "N/A"),
        overall_signal=overall.get("direction", "N/A"),
        signal_strength=overall.get("strength", "N/A")
    )


def build_quant_interpretation_prompt(
    stock_code: str,
    current_price: float,
    quant: dict
) -> str:
    """
    Build the quant signal interpretation prompt.

    Args:
        stock_code: Stock code
        current_price: Current stock price
        quant: Quant signal data from /stocks/{code}/quant

    Returns:
        Formatted prompt string
    """
    signals = quant.get("signals", {})
    overall = quant.get("overall_signal", {})
    factors = quant.get("factors", [])

    # Get latest factor values
    latest = factors[0] if factors else {}

    macd = signals.get("macd", {})
    kdj = signals.get("kdj", {})
    rsi = signals.get("rsi", {})
    boll = signals.get("boll", {})

    boll_value = boll.get("value", {})

    return QUANT_SIGNAL_INTERPRETATION_PROMPT.format(
        stock_code=stock_code,
        current_price=current_price if current_price else "N/A",
        macd_dif=latest.get("macd_dif", "N/A"),
        macd_dea=latest.get("macd_dea", "N/A"),
        macd_value=macd.get("value", "N/A"),
        macd_signal=macd.get("signal", "N/A"),
        kdj_k=latest.get("kdj_k", "N/A"),
        kdj_d=latest.get("kdj_d", "N/A"),
        kdj_j=kdj.get("value", "N/A"),
        kdj_signal=kdj.get("signal", "N/A"),
        rsi_value=rsi.get("value", "N/A"),
        rsi_signal=rsi.get("signal", "N/A"),
        boll_upper=boll_value.get("upper", "N/A") if isinstance(boll_value, dict) else "N/A",
        boll_mid=boll_value.get("mid", "N/A") if isinstance(boll_value, dict) else "N/A",
        boll_lower=boll_value.get("lower", "N/A") if isinstance(boll_value, dict) else "N/A",
        boll_signal=boll.get("signal", "N/A"),
        overall_direction=overall.get("direction", "N/A"),
        overall_strength=overall.get("strength", "N/A"),
        overall_score=overall.get("score", "N/A")
    )
