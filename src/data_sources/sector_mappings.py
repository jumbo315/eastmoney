"""
Sector and industry code mappings for TuShare Pro APIs.

Maps Chinese sector names to:
- TuShare concept codes (BK series)
- THS (同花顺) index codes (.TI suffix)

Author: TuShare Migration Phase 5
Date: 2026-01-24
"""

from typing import Optional


# 东方财富行业名称 → TuShare概念代码 (BK系列)
SECTOR_TO_CONCEPT_CODE = {
    # 科技板块
    "半导体": "BK0436",
    "芯片": "BK0436",
    "集成电路": "BK0436",
    "软件服务": "BK0474",
    "软件": "BK0474",
    "人工智能": "BK0804",
    "AI": "BK0804",
    "5G": "BK0634",
    "5G概念": "BK0634",
    "云计算": "BK0718",
    "大数据": "BK0714",
    "物联网": "BK0672",
    "区块链": "BK0816",
    "网络安全": "BK0718",

    # 新能源板块
    "新能源车": "BK0493",
    "新能源汽车": "BK0493",
    "锂电池": "BK1033",
    "光伏": "BK0493",
    "太阳能": "BK0493",
    "风电": "BK0493",
    "储能": "BK1033",
    "充电桩": "BK0901",

    # 医药板块
    "医药": "BK0451",
    "医药生物": "BK0451",
    "生物医药": "BK0451",
    "中药": "BK0464",
    "医疗器械": "BK0536",
    "疫苗": "BK0899",
    "CXO": "BK0899",

    # 消费板块
    "白酒": "BK0477",
    "酿酒": "BK0477",
    "食品饮料": "BK0438",
    "餐饮": "BK0438",
    "旅游": "BK0454",
    "酒店": "BK0454",
    "零售": "BK0437",
    "家电": "BK0481",
    "化妆品": "BK0437",

    # 金融板块
    "银行": "BK0456",
    "券商": "BK0473",
    "证券": "BK0473",
    "保险": "BK0474",
    "信托": "BK0475",

    # 工业板块
    "军工": "BK0490",
    "国防军工": "BK0490",
    "航空航天": "BK0490",
    "船舶": "BK0498",
    "工程机械": "BK0437",
    "机器人": "BK0701",
    "智能制造": "BK0701",

    # 材料板块
    "新材料": "BK0829",
    "有色金属": "BK0478",
    "钢铁": "BK0428",
    "化工": "BK0419",
    "稀土": "BK1036",

    # 地产建筑
    "房地产": "BK0451",
    "建筑": "BK0425",
    "基建": "BK0425",
    "装修装饰": "BK0433",

    # 电子信息
    "电子": "BK0428",
    "电子信息": "BK0428",
    "消费电子": "BK0732",
    "通信": "BK0447",
    "通信设备": "BK0447",

    # 能源
    "石油": "BK0424",
    "煤炭": "BK0427",
    "电力": "BK0428",
    "天然气": "BK0843",

    # 其他
    "环保": "BK0461",
    "农业": "BK0420",
    "传媒": "BK0489",
    "游戏": "BK0479",
    "教育": "BK0740",
}


# 同花顺板块代码映射 (.TI 后缀)
THS_SECTOR_CODES = {
    # 主流指数
    "半导体": "884001.TI",
    "芯片": "884001.TI",
    "新能源车": "884002.TI",
    "医药": "884003.TI",
    "白酒": "884004.TI",
    "券商": "884005.TI",
    "银行": "884006.TI",
    "保险": "884007.TI",
    "5G": "884008.TI",
    "军工": "884009.TI",
    "光伏": "884010.TI",
    "锂电池": "884011.TI",
    "人工智能": "884012.TI",
    "新材料": "884013.TI",
    "云计算": "884014.TI",
    "区块链": "884015.TI",
    "物联网": "884016.TI",
    "大数据": "884017.TI",
    "机器人": "884018.TI",
    "环保": "884019.TI",
    "食品饮料": "884020.TI",
    "房地产": "884021.TI",
    "建筑": "884022.TI",
    "钢铁": "884023.TI",
    "煤炭": "884024.TI",
    "有色金属": "884025.TI",
    "化工": "884026.TI",
    "电子": "884027.TI",
    "通信": "884028.TI",
    "计算机": "884029.TI",
    "传媒": "884030.TI",
    "游戏": "884031.TI",
}


# 行业中文名称规范化映射
SECTOR_NAME_ALIASES = {
    "芯片": "半导体",
    "集成电路": "半导体",
    "软件": "软件服务",
    "AI": "人工智能",
    "5G概念": "5G",
    "新能源汽车": "新能源车",
    "锂电": "锂电池",
    "太阳能": "光伏",
    "医药生物": "医药",
    "生物医药": "医药",
    "酿酒": "白酒",
    "证券": "券商",
    "国防军工": "军工",
    "电子信息": "电子",
}


def get_concept_code(sector_name: str) -> Optional[str]:
    """
    Get TuShare concept code by sector name.

    Args:
        sector_name: Chinese sector name (e.g., "半导体", "新能源车")

    Returns:
        TuShare concept code (e.g., "BK0436") or None if not found
    """
    if not sector_name:
        return None

    # Try direct lookup
    code = SECTOR_TO_CONCEPT_CODE.get(sector_name)
    if code:
        return code

    # Try normalized name
    normalized = SECTOR_NAME_ALIASES.get(sector_name)
    if normalized:
        return SECTOR_TO_CONCEPT_CODE.get(normalized)

    # Fuzzy match (contains)
    for key, value in SECTOR_TO_CONCEPT_CODE.items():
        if sector_name in key or key in sector_name:
            return value

    return None


def get_ths_code(sector_name: str) -> Optional[str]:
    """
    Get THS (同花顺) index code by sector name.

    Args:
        sector_name: Chinese sector name (e.g., "半导体", "新能源车")

    Returns:
        THS index code (e.g., "884001.TI") or None if not found
    """
    if not sector_name:
        return None

    # Try direct lookup
    code = THS_SECTOR_CODES.get(sector_name)
    if code:
        return code

    # Try normalized name
    normalized = SECTOR_NAME_ALIASES.get(sector_name)
    if normalized:
        return THS_SECTOR_CODES.get(normalized)

    # Fuzzy match
    for key, value in THS_SECTOR_CODES.items():
        if sector_name in key or key in sector_name:
            return value

    return None


def normalize_sector_name(sector_name: str) -> str:
    """
    Normalize sector name to standard form.

    Args:
        sector_name: Input sector name

    Returns:
        Normalized sector name
    """
    if not sector_name:
        return sector_name

    # Check if alias exists
    return SECTOR_NAME_ALIASES.get(sector_name, sector_name)


def get_all_supported_sectors() -> list:
    """
    Get list of all supported sector names.

    Returns:
        List of sector names with TuShare mappings
    """
    return sorted(set(SECTOR_TO_CONCEPT_CODE.keys()) | set(SECTOR_NAME_ALIASES.keys()))
