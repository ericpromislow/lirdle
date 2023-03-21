// Copyright (C) 2023 Bovination Productions, MIT License

import { WORDS } from "./words.js";
import * as perturb from './perturb.js';

export function getDateNumber() {
    const d = new Date();
    const year = d.getFullYear().toString();
    let month = (d.getMonth() + 1).toString();
    let date = d.getDate().toString();
    if (month.length === 1) {
        month = '0' + month;
    }
    if (date.length === 1) {
        date = '0' + date;
    }
    const d2 = Date.parse(`${ year }-${ month }-${ date }T04:00:00`);
    const d1 = Date.parse('2023-02-18T00:00:00');
    const numDaysSince = Math.floor((d2 - d1)/(1000.0 * 24 * 3600));
    return 20230218 + numDaysSince;
}

export function getYesterdaysWord() {
    const num = getWordNumber(getDateNumber() - 1);
    return WORDS[num];
}

export function getWordNumber(dateNumber) {
    if (devMode()) {
        return Math.floor(Math.random() * WORDS.length);
    } else {
        const pos = POSITIONS[dateNumber % POSITIONS.length];
        if (pos < WORDS.length) {
            return pos;
        }
        console.log(`Can't find position ${pos}, only have #{ WORDS.length } words`);
        // this cycles through the list sort of randomly but not really
        return ((dateNumber * 2 + 1) * 1793) % WORDS.length;
    }
}

export function devMode() {
    return (location.hostname === "localhost" || location.hostname === "127.0.0.1");// && Math.random() < 0.00000001;
}

// Modifies both arguments
export function lie(guessWord, scores, lettersByPosition, changes) {
    const [i, direction] = perturb.perturb(guessWord, scores, lettersByPosition);
    const oldVal = scores[i] + 3;
    scores[i] = (oldVal + direction) % 3;
    changes.push([i, oldVal - 3, scores[i]]);

    lettersByPosition.assignments[guessWord] ??= [];
    lettersByPosition.assignments[guessWord].push([i, direction]);
}

export const POSITIONS = [2253, 191, 608, 45, 1461, 706, 264, 2012, 1404, 1244,
1822, 1477, 1350, 139, 1514, 1827, 1969, 1631, 770, 1359,
1415, 521, 1526, 890, 1596, 173, 1704, 1570, 2206, 1116,
1241, 1152, 1794, 1148, 622, 308, 289, 1871, 246, 635,
1901, 1661, 1826, 2078, 1092, 725, 710, 785, 1835, 1451,
858, 389, 759, 2143, 1861, 261, 506, 2043, 537, 55, 1513,
1503, 1850, 1213, 605, 1140, 2277, 2269, 1386, 849, 997,
741, 1947, 2228, 1380, 2330, 586, 1787, 1443, 364, 562,
58, 204, 716, 1572, 525, 1795, 1164, 517, 402, 774, 2108,
179, 1306, 1020, 539, 330, 1591, 861, 1955, 2190, 837,
507, 1743, 916, 740, 1720, 1842, 647, 652, 532, 1410,
1840, 640, 408, 2034, 2229, 83, 5, 496, 678, 1292, 1221,
2258, 145, 1658, 1569, 823, 1669, 1329, 305, 813, 1982,
81, 148, 1934, 1709, 136, 514, 583, 1333, 891, 2120, 1013,
80, 458, 503, 1593, 1059, 2216, 1852, 691, 1703, 281, 685,
1295, 127, 897, 1432, 1312, 565, 2105, 2104, 1474, 1903,
1621, 1887, 1488, 368, 812, 1617, 2214, 104, 1057, 1136,
2053, 1830, 2, 2157, 7, 1744, 2232, 879, 1531, 1195, 1756,
97, 1034, 1589, 697, 1656, 1715, 1875, 681, 572, 923,
1293, 59, 1797, 531, 1046, 1060, 653, 1938, 1128, 382,
180, 176, 181, 27, 764, 1906, 166, 2343, 1082, 2161, 2127,
2155, 730, 12, 2355, 2057, 1785, 1630, 1421, 1052, 1823,
1268, 939, 908, 2128, 2312, 1237, 857, 1253, 10, 870, 484,
99, 1559, 1999, 1594, 1683, 2022, 2017, 994, 223, 112,
526, 2035, 2062, 1636, 1734, 2016, 1600, 842, 115, 954,
1920, 150, 1546, 365, 2226, 397, 411, 425, 1449, 1977,
1818, 576, 1673, 1047, 1279, 2144, 1124, 960, 591, 835,
803, 1064, 1089, 1185, 1948, 1023, 1389, 1145, 1667, 107,
1122, 165, 456, 557, 38, 1735, 662, 1115, 1110, 1127,
1644, 2193, 2204, 1878, 1568, 568, 1462, 1491, 169, 303,
1317, 2276, 1005, 2391, 1731, 140, 1335, 2101, 547, 552,
630, 1105, 2381, 1839, 1962, 22, 1675, 439, 928, 100, 13,
2030, 2027, 1894, 2285, 134, 827, 1781, 2135, 2356, 53,
984, 1230, 665, 1413, 1963, 1925, 651, 574, 1931, 171,
1730, 1976, 1967, 751, 1314, 2008, 2178, 800, 1950, 2202,
1540, 2374, 2041, 1881, 370, 522, 407, 33, 2096, 639, 956,
1758, 1530, 1556, 952, 1768, 581, 1360, 1392, 1723, 1678,
1248, 57, 1588, 1786, 2080, 1309, 1299, 2393, 750, 1849,
1270, 832, 298, 909, 2029, 633, 720, 2025, 487, 1633, 216,
598, 21, 1157, 1507, 399, 964, 414, 95, 2126, 1759, 1282,
40, 758, 1974, 2060, 882, 1548, 559, 666, 1863, 440, 1804,
1843, 2118, 1681, 326, 1324, 2350, 1274, 2141, 2121, 802,
346, 593, 738, 2230, 1109, 966, 2170, 550, 421, 2410,
2107, 1571, 957, 1297, 125, 768, 746, 1638, 1782, 636,
11, 1454, 1372, 2392, 190, 2294, 2239, 1117, 1240, 1368,
1927, 1340, 1121, 1778, 1726, 815, 670, 1418, 451, 123,
1590, 610, 336, 385, 2367, 378, 2217, 300, 1601, 200,
1776, 949, 996, 111, 1729, 1354, 1212, 1053, 437, 193,
1560, 1069, 1328, 1171, 1233, 822, 286, 2194, 2271, 177,
2171, 2153, 632, 888, 1637, 71, 2149, 2397, 905, 961, 492,
615, 795, 1958, 210, 1862, 164, 1247, 358, 20, 266, 1629,
609, 1363, 587, 2341, 747, 1137, 1528, 864, 1139, 1952,
301, 1342, 284, 2163, 2264, 1815, 465, 1497, 2111, 1236,
1578, 1516, 2048, 1792, 1439, 1670, 1722, 696, 2058, 1855,
1218, 1565, 477, 704, 41, 1979, 556, 1098, 2065, 84, 1049,
117, 1956, 1464, 2189, 1135, 143, 566, 2136, 1435, 2074,
1264, 1933, 219, 325, 2162, 1659, 46, 2024, 545, 290, 254,
1146, 1691, 645, 49, 314, 1905, 428, 646, 461, 570, 418,
393, 511, 530, 1564, 1619, 1908, 2256, 629, 36, 1595,
2242, 1091, 214, 814, 309, 1699, 1172, 2159, 209, 766,
1996, 757, 944, 945, 1504, 1210, 555, 464, 1118, 1434,
1869, 860, 2288, 1941, 1466, 1284, 132, 1245, 1267, 374,
1129, 1640, 1175, 2191, 1865, 1799, 734, 1054, 282, 1641,
1672, 1940, 2270, 1563, 543, 529, 1316, 2334, 2234, 2236,
1403, 912, 1935, 1851, 1075, 806, 1707, 66, 347, 1231,
167, 1836, 1176, 2223, 2072, 1099, 621, 1327, 98, 268,
342, 94, 689, 1714, 1626, 2240, 1469, 2045, 2187, 1498,
844, 1072, 1441, 2307, 1198, 1357, 536, 1505, 422, 1493,
1793, 56, 1361, 1243, 671, 2210, 2339, 401, 1791, 2192,
626, 1880, 486, 707, 1519, 1323, 846, 1149, 1521, 1932,
794, 446, 288, 489, 2114, 1096, 1026, 1296, 1737, 1981,
2014, 638, 349, 82, 1711, 1904, 205, 999, 2352, 2021,
1455, 2001, 256, 2310, 2052, 693, 2039, 2284, 37, 2196,
1381, 1606, 883, 2093, 1494, 222, 2137, 245, 119, 157,
273, 1150, 291, 1639, 617, 2349, 1419, 1431, 1010, 1539,
333, 2066, 144, 563, 900, 1300, 2215, 597, 2359, 396,
1517, 2399, 195, 600, 1009, 315, 1808, 896, 1898, 974,
1310, 279, 1798, 2119, 660, 1496, 1412, 403, 1163, 808,
105, 1522, 2134, 1856, 817, 1428, 700, 1437, 2248, 1654,
1090, 1319, 599, 2311, 658, 130, 1889, 1346, 1867, 1914,
2031, 1387, 1602, 236, 269, 656, 1345, 1467, 302, 65, 903,
485, 1108, 208, 156, 1138, 2098, 1520, 1821, 1394, 1229,
30, 2054, 2109, 447, 906, 825, 2203, 732, 318, 341, 163,
1879, 1567, 1402, 398, 462, 2233, 1915, 1801, 1322, 295,
1592, 1741, 1068, 935, 211, 769, 120, 19, 1458, 1371, 235,
756, 353, 1348, 778, 2165, 1883, 2368, 501, 29, 1298, 257,
1442, 618, 1313, 1036, 1281, 1740, 1705, 2318, 1016, 126,
2007, 158, 323, 763, 782, 1425, 1562, 2175, 355, 1087,
1690, 1197, 560, 63, 69, 1552, 1846, 1627, 1543, 197, 141,
510, 153, 1954, 1396, 831, 1444, 1484, 1620, 2331, 564,
1693, 2388, 1035, 2346, 1395, 467, 962, 714, 2083, 388,
674, 384, 1890, 1263, 2158, 712, 1811, 1190, 2282, 2309,
2281, 976, 703, 103, 1250, 1048, 1103, 1330, 2313, 2249,
867, 777, 826, 1760, 1302, 2255, 650, 990, 2405, 1698,
1577, 833, 1502, 24, 1331, 2184, 1102, 500, 331, 1104,
1061, 1433, 978, 2304, 1478, 938, 1692, 2130, 755, 2115,
977, 2103, 1581, 1030, 1238, 1042, 951, 1339, 160, 2372,
1829, 1050, 1271, 1232, 749, 1649, 1857, 2327, 885, 1558,
1769, 172, 554, 1305, 85, 1366, 499, 2169, 1751, 2252,
1749, 26, 1662, 91, 2336, 1960, 102, 352, 659, 604, 613,
1870, 852, 1420, 424, 476, 2335, 1349, 1325, 1040, 2050,
1657, 1414, 1770, 155, 475, 866, 1610, 1205, 351, 2260,
828, 1044, 664, 1727, 1515, 1142, 1475, 2300, 2347, 623,
1246, 824, 1179, 2246, 869, 533, 1921, 744, 886, 1258,
708, 1696, 1288, 1708, 490, 395, 2133, 2139, 1695, 92,
512, 1603, 1373, 1351, 679, 2138, 1459, 497, 924, 875,
2195, 1750, 1599, 614, 457, 717, 350, 1544, 840, 2185,
1716, 541, 1512, 2265, 1575, 1453, 287, 1991, 505, 1416,
2245, 702, 1216, 479, 2167, 2117, 1355, 1844, 2154, 1951,
775, 1747, 1133, 2403, 2164, 1344, 940, 1893, 544, 904,
1154, 753, 1790, 23, 2320, 137, 332, 1186, 661, 2379, 299,
567, 548, 2364, 194, 306, 589, 1076, 1125, 1618, 360, 724,
1897, 2026, 1771, 1112, 272, 441, 874, 445, 805, 1379,
1134, 1261, 1989, 1465, 2168, 252, 1810, 2366, 2377, 375,
2243, 963, 2208, 723, 230, 986, 312, 1184, 765, 186, 386, 2412,
578, 2037, 2398, 2063, 274, 1352, 2205, 695, 310, 1717,
495, 220, 642, 75, 1964, 1472, 553, 2207, 1866, 1671, 950,
1779, 51, 280, 850, 1095, 975, 2235, 2227, 294, 513, 1946,
293, 1397, 1417, 1446, 1165, 1970, 1959, 229, 483, 688,
654, 339, 1123, 174, 320, 168, 655, 466, 811, 981, 1255,
206, 873, 406, 965, 1666, 920, 2302, 420, 876, 1120, 2055,
2089, 2401, 443, 1926, 275, 371, 1499, 265, 1143, 946,
549, 1080, 968, 596, 1783, 1796, 1739, 234, 1586, 2033,
528, 232, 2344, 1886, 663, 760, 383, 2278, 72, 668, 1078,
1645, 1003, 1923, 973, 509, 2002, 705, 1888, 2358, 429,
2176, 1583, 884, 1992, 698, 709, 2212, 1017, 442, 631,
241, 2015, 1524, 2408, 1471, 2345, 73, 2387, 14, 592,
1529, 2303, 345, 2323, 918, 1523, 1436, 2116, 61, 682,
1126, 122, 1291, 1650, 1187, 2095, 2275, 508, 17, 1682,
2283, 1065, 2295, 203, 742, 728, 116, 2076, 1084, 2361,
2146, 1058, 74, 1634, 677, 4, 1424, 250, 729, 1356, 1482,
2328, 356, 1597, 189, 2199, 1545, 149, 319, 1166, 970,
1289, 901, 675, 1015, 1848, 151, 344, 1574, 683, 101,
1224, 2237, 2166, 1347, 1738, 847, 1251, 2321, 377, 3,
843, 109, 2319, 878, 2182, 2221, 1055, 1337, 2251, 372,
762, 1537, 1277, 335, 1294, 1468, 1939, 929, 1834, 2122,
480, 1257, 637, 2173, 1107, 170, 381, 129, 2382, 77, 932,
1604, 603, 240, 1315, 1896, 953, 1043, 588, 32, 1732,
1988, 161, 937, 733, 478, 431, 1159, 1365, 463, 1207,
1155, 2360, 1215, 809, 995, 1100, 1746, 1211, 1772, 2112,
1144, 1623, 2013, 1719, 571, 799, 1353, 899, 1487, 472,
1479, 788, 453, 1220, 1622, 249, 2273, 1301, 1321, 772,
1937, 2262, 2064, 106, 2097, 1868, 198, 926, 2287, 369,
1680, 76, 34, 2219, 188, 89, 154, 2326, 2279, 128, 1995,
2006, 1973, 726, 1427, 1041, 1382, 2353, 1664, 2090, 1764,
1407, 607, 2332, 1854, 2402, 2293, 1978, 135, 1199, 459,
1924, 914, 1998, 856, 297, 2009, 771, 669, 1201, 311,
1448, 2371, 1882, 142, 1686, 1949, 2231, 159, 1536, 1285,
243, 221, 1807, 1918, 2156, 2059, 1913, 70, 1398, 1742,
992, 524, 1509, 2259, 1972, 2351, 2296, 1399, 1909, 2261,
1028, 2077, 1907, 624, 391, 1303, 657, 192, 1311, 1736,
1260, 1533, 787, 2286, 845, 1390, 2070, 1204, 2354, 2145,
887, 259, 1450, 2099, 2172, 958, 455, 2004, 2394, 2268,
979, 2129, 540, 620, 1106, 1864, 1066, 1725, 255, 1953,
31, 354, 1803, 889, 340, 667, 1160, 1553, 2046, 1007,
2198, 2244, 1024, 28, 1269, 217, 1114, 1997, 816, 2266,
1748, 538, 25, 187, 201, 2274, 1480, 1752, 277, 1085,
1283, 711, 1318, 44, 834, 410, 2085, 2020, 239, 6, 1400,
2023, 87, 854, 1162, 242, 2337, 183, 1757, 1460, 855,
2047, 1542, 2254, 237, 251, 1813, 366, 1401, 233, 1226,
468, 1916, 1500, 1688, 1576, 409, 2201, 15, 1767, 1181,
432, 1942, 2209, 1990, 1655, 1200, 2181, 413, 1326, 131,
491, 213, 1573, 1511, 980, 482, 1632, 1193, 1900, 218,
2317, 90, 1473, 454, 88, 2357, 1833, 641, 427, 1733, 1209,
542, 1884, 1910, 911, 1081, 207, 1168, 2092, 1093, 2373,
1077, 1338, 248, 2038, 1254, 337, 1966, 1025, 2188, 1336,
47, 1411, 1358, 1073, 1225, 1985, 1177, 1745, 1891, 839,
313, 78, 1032, 2370, 1987, 1463, 628, 108, 1635, 1706,
948, 1132, 790, 1111, 225, 793, 848, 1860, 1440, 292,
1847, 2010, 1405, 1304, 1582, 1700, 392, 947, 1557, 2395,
182, 448, 558, 606, 2011, 2061, 329, 1445, 405, 1800,
1689, 1819, 820, 1724, 2113, 2297, 68, 444, 1320, 1376,
1859, 1239, 1364, 1812, 584, 1872, 579, 1031, 2142, 731,
450, 594, 469, 2220, 1652, 1287, 1660, 818, 718, 238,
1249, 838, 2308, 625, 2067, 1423, 460, 2211, 1012, 1490,
1858, 1367, 328, 2197, 927, 433, 1506, 1070, 627, 2369,
2409, 930, 1763, 910, 367, 1615, 1492, 520, 1183, 1961,
821, 836, 590, 502, 2338, 1370, 2091, 2280, 2100, 573,
2068, 2400, 1607, 2238, 881, 1587, 1147, 481, 1273, 1265,
2250, 1547, 872, 1928, 1702, 1222, 518, 260, 1611, 436,
50, 931, 1676, 2385, 898, 1151, 415, 244, 178, 2299, 2225,
1554, 1045, 991, 394, 449, 1911, 516, 1944, 1141, 715,
1219, 575, 893, 781, 146, 1614, 1018, 1534, 2290, 1930,
1806, 2086, 1853, 202, 2088, 735, 699, 324, 1088, 810,
380, 851, 1189, 2075, 859, 686, 2333, 1541, 1214, 1518,
1845, 1063, 1919, 2036, 2032, 2386, 776, 1252, 1019, 1766,
767, 2376, 1378, 2087, 1202, 1584, 1971, 124, 270, 400,
1426, 868, 2375, 2362, 1393, 423, 1022, 737, 322, 987,
62, 1535, 2267, 871, 2213, 2056, 1728, 1841, 892, 212,
673, 1598, 1062, 138, 580, 1094, 2110, 1383, 1429, 438,
2396, 1957, 1986, 792, 993, 474, 2102, 1965, 316, 546,
1922, 1525, 2289, 1780, 1174, 278, 42, 1527, 2084, 1, 917,
2389, 2123, 701, 1585, 752, 162, 2222, 1980, 263, 988,
343, 535, 362, 2314, 967, 493, 2365, 595, 577, 1495, 2406,
1130, 1912, 2272, 54, 1056, 2151, 1029, 1170, 1156, 602,
35, 2363, 1701, 52, 936, 1805, 1362, 215, 1374, 1510, 941,
348, 1943, 361, 1605, 1877, 2291, 684, 1470, 1648, 649,
1002, 754, 863, 1773, 2224, 1532, 1838, 907, 363, 1832,
2049, 1161, 2322, 865, 1712, 1551, 2081, 1902, 2348, 1685,
1038, 1643, 262, 1406, 739, 357, 877, 1775, 1452, 1422,
1000, 569, 1481, 2000, 1828, 1814, 644, 721, 184, 1687,
619, 224, 471, 1180, 1761, 616, 2340, 1067, 1489, 1555,
1613, 258, 1483, 199, 226, 152, 983, 247, 1039, 18, 1385,
1501, 1721, 2263, 680, 2094, 921, 2325, 376, 2152, 1167,
862, 1561, 1223, 1119, 1674, 797, 470, 692, 2301, 1027,
1538, 2329, 253, 1188, 1993, 1945, 1788, 2069, 60, 67,
2106, 2005, 761, 2082, 379, 998, 2042, 582, 86, 2404,
1256, 736, 722, 373, 498, 114, 435, 307, 919, 1566, 39,
1668, 687, 1203, 2124, 902, 175, 2247, 147, 985, 959,
1227, 933, 1929, 16, 9, 1278, 1777, 1476, 2132, 121, 807,
426, 404, 2218, 2150, 185, 830, 1008, 504, 1430, 1876,
989, 922, 1384, 452, 1011, 2148, 612, 727, 64, 390, 1895,
1343, 783, 791, 1191, 1375, 1447, 1101, 1158, 1234, 1217,
1789, 789, 561, 359, 118, 2305, 1079, 1873, 1192, 416,
317, 2179, 1825, 1208, 2177, 2407, 1820, 1774, 780, 2125,
1684, 321, 1697, 841, 913, 2079, 779, 1765, 2174, 601,
925, 296, 2411, 1984, 2040, 1899, 473, 387, 1625, 2257,
1004, 1071, 773, 1694, 1037, 2131, 1074, 1334, 895, 1628,
1021, 1275, 419, 2298, 488, 713, 2306, 853, 2180, 285,
283, 551, 982, 327, 1332, 1169, 1286, 1549, 2390, 110,
519, 334, 1178, 2003, 643, 1885, 1486, 1677, 1006, 1014,
1228, 943, 338, 1609, 1266, 1975, 43, 2183, 227, 694,
2147, 1438, 276, 1262, 585, 1377, 228, 1409, 2071, 1051,
1802, 113, 2380, 1182, 1713, 894, 2241, 1642, 412, 784,
1131, 1457, 648, 743, 0, 745, 1153, 417, 1308, 1280, 955,
1242, 690, 2383, 1369, 915, 786, 1388, 1290, 804, 672,
1235, 1033, 972, 1653, 1580, 1824, 1113, 2186, 1341, 611,
971, 1837, 1994, 634, 267, 534, 1608, 1968, 2028, 2051,
2324, 1456, 1679, 719, 133, 1784, 434, 2140, 1485, 1754,
1276, 969, 1206, 271, 2073, 231, 1097, 1307, 196, 1718,
1874, 1616, 8, 796, 1809, 1831, 2315, 430, 1817, 1917,
2342, 48, 801, 494, 1173, 1663, 1646, 1936, 1983, 1083,
1194, 748, 1086, 934, 676, 1762, 2200, 1647, 93, 1612,
96, 1651, 1624, 1753, 2316, 1259, 819, 1755, 304, 2378,
523, 880, 2160, 79, 2384, 1892, 527, 1196, 2044, 1816,
829, 515, 1665, 942, 1408, 2292, 1579, 1391, 1272, 1508,
1550, 1001, 1710, 798, 2019, 2018];
