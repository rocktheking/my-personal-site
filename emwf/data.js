export const spectrumData = [
  {
    "id": 1,
    "name": "蓝牙 (Bluetooth)",
    "category": "短距离通信",
    "frequency_range_str": "2.402 - 2.480 GHz",
    "frequency_min_hz": 2402000000,
    "frequency_max_hz": 2480000000,
    "wavelength_str": "12.1 cm - 12.5 cm",
    "characteristics": "工作在拥挤的2.4 GHz ISM频段，使用跳频扩频（FHSS）技术来减轻干扰。存在两种主要变体：经典蓝牙（BR/EDR）用于音频流，速率高达3 Mb/s；低功耗蓝牙（BLE）则为超低功耗的物联网应用优化，支持点对点、广播和网状拓扑，数据速率从125 Kb/s到2 Mb/s。其范围非常灵活，根据功率等级、天线和环境的不同，可以从不到一米到超过一公里。",
    "applications": [
      "无线耳机和扬声器",
      "车载信息娱乐系统",
      "可穿戴健身追踪器",
      "物联网传感器和设备",
      "资产追踪和定位服务",
      "无线外围设备（键盘、鼠标）"
    ]
  },
  {
    "id": 2,
    "name": "星闪 (NearLink)",
    "category": "短距离通信",
    "frequency_range_str": "2.400 - 2.4835 GHz",
    "frequency_min_hz": 2400000000,
    "frequency_max_hz": 2483500000,
    "wavelength_str": "12.1 cm - 12.5 cm",
    "characteristics": "在中国开发的新一代短距离无线通信技术，旨在提供优于传统蓝牙和Wi-Fi的延迟和可靠性性能。它使用频谱自适应、信道优化和5G Polar码等先进技术，即使在复杂环境中也能实现低延迟、高可靠性和高并发性。它旨在支持大量同时连接并保持高稳定性。",
    "applications": [
      "智能家居设备生态系统",
      "高保真无线音频",
      "先进的可穿戴设备",
      "工业自动化与控制",
      "智能汽车系统"
    ]
  },
  {
    "id": 3,
    "name": "Wi-Fi 6E / Wi-Fi 7 (6 GHz)",
    "category": "短距离通信",
    "frequency_range_str": "5.925 - 7.125 GHz",
    "frequency_min_hz": 5925000000,
    "frequency_max_hz": 7125000000,
    "wavelength_str": "4.2 cm - 5.1 cm",
    "characteristics": "利用6 GHz频段，这是一个拥塞较少且无传统设备干扰的“绿地”频谱。这使得极高的吞吐量和低延迟成为可能。关键技术包括超宽的320 MHz信道、4K-QAM调制和多链路操作（MLO），允许在多个频段上同时进行数据传输。虽然性能优越，但其信号范围比低频段短，穿透障碍物的能力也较差。该频段也被视为未来5G/6G移动通信的候选频段。",
    "applications": [
      "增强/虚拟现实 (AR/VR)",
      "云游戏和8K视频流",
      "高密度公共场所（体育场、机场）",
      "远程医疗和远程手术",
      "工业应用的时间敏感网络 (TSN)"
    ]
  },
  {
    "id": 4,
    "name": "2.4 GHz ISM频段",
    "category": "ISM频段",
    "frequency_range_str": "2.400 - 2.500 GHz",
    "frequency_min_hz": 2400000000,
    "frequency_max_hz": 2500000000,
    "wavelength_str": "12.0 cm - 12.5 cm",
    "characteristics": "一个全球可用的、无需许可的频段，指定用于工业、科学和医疗（ISM）目的。其广泛的可用性使其成为众多短距离通信技术的基础。然而，这种普及性导致了来自Wi-Fi、蓝牙和微波炉等各种设备的严重频谱拥塞和干扰。",
    "applications": [
      "Wi-Fi (802.11b/g/n/ax)",
      "蓝牙和低功耗蓝牙",
      "星闪 (NearLink)",
      "Zigbee和其他物联网协议",
      "微波炉",
      "无绳电话和婴儿监视器"
    ]
  },
  {
    "id": 5,
    "name": "5.8 GHz ISM频段",
    "category": "ISM频段",
    "frequency_range_str": "5.725 - 5.875 GHz",
    "frequency_min_hz": 5725000000,
    "frequency_max_hz": 5875000000,
    "wavelength_str": "5.1 cm - 5.2 cm",
    "characteristics": "一个无需许可的ISM频段，是Wi-Fi使用的更广泛的5 GHz频谱的一部分。它提供比2.4 GHz频段明显更多的带宽，并且通常不那么拥挤，从而允许更高的数据速率。其主要缺点是有效范围较短，穿透墙壁等固体物体的能力较差。",
    "applications": [
      "Wi-Fi (802.11a/n/ac/ax)",
      "无人机遥控和视频链路",
      "点对点无线网桥",
      "工业监控系统"
    ]
  },
  {
    "id": 6,
    "name": "UHF波段",
    "category": "卫星通信",
    "frequency_range_str": "300 MHz - 3 GHz",
    "frequency_min_hz": 300000000,
    "frequency_max_hz": 3000000000,
    "wavelength_str": "10 cm - 1 m",
    "characteristics": "该波段包括L波段和S波段，具有良好的信号穿透障碍物和天气的能力，使其对于各种移动和广播应用非常可靠。然而，它提供的带宽相对较窄，限制了数据速率。该波段的天线物理尺寸比高频天线大。它是一个多功能波段，用于电视广播、移动通信和专业的卫星服务。",
    "applications": [
      "地面电视广播",
      "军事卫星通信 (MUOS)",
      "陆地移动无线电系统（对讲机）",
      "GPS/GNSS导航系统 (L波段)",
      "空间遥测和跟踪"
    ]
  },
  {
    "id": 7,
    "name": "L波段",
    "category": "导航",
    "frequency_range_str": "1 - 2 GHz",
    "frequency_min_hz": 1000000000,
    "frequency_max_hz": 2000000000,
    "wavelength_str": "15 cm - 30 cm",
    "characteristics": "以其卓越的可靠性和全天候性能而著称。该波段的信号能极好地穿透云、雨和植被，并且受雨衰的影响极小。这使其成为全球导航和移动卫星服务的首选，因为在这些服务中正常运行时间至关重要。",
    "applications": [
      "GPS, GLONASS, Galileo, BeiDou (GNSS)",
      "移动卫星电话 (Inmarsat, Iridium)",
      "航空和海事通信",
      "地球观测和遥感"
    ]
  },
  {
    "id": 8,
    "name": "S波段",
    "category": "卫星通信",
    "frequency_range_str": "2 - 4 GHz",
    "frequency_min_hz": 2000000000,
    "frequency_max_hz": 4000000000,
    "wavelength_str": "7.5 cm - 15 cm",
    "characteristics": "在L波段的强大穿透能力和C波段的更高带宽之间提供了平衡。它具有良好的抗雨衰能力，适用于移动应用。由于对水滴的敏感性，该波段是气象雷达的主力。",
    "applications": [
      "天气和水面舰艇雷达",
      "NASA空间通信（包括阿波罗任务）",
      "移动卫星服务",
      "地球观测卫星"
    ]
  },
  {
    "id": 9,
    "name": "C波段",
    "category": "卫星通信",
    "frequency_range_str": "4 - 8 GHz",
    "frequency_min_hz": 4000000000,
    "frequency_max_hz": 8000000000,
    "wavelength_str": "3.75 cm - 7.5 cm",
    "characteristics": "卫星产业的历史支柱，以其高可靠性和对雨衰的极低敏感性而备受推崇。这使得其可以实现广阔、稳定的覆盖范围，非常适合关键任务服务。一个关键的权衡是，与更高频段相比，需要更大的地面站天线。在一些地区，该波段的部分频谱正被重新分配给地面5G服务。",
    "applications": [
      "向附属机构分发电视网络",
      "专业视频广播",
      "电信网络骨干",
      "用于企业和海事用途的VSAT网络"
    ]
  },
  {
    "id": 10,
    "name": "X波段",
    "category": "雷达",
    "frequency_range_str": "8 - 12 GHz",
    "frequency_min_hz": 8000000000,
    "frequency_max_hz": 12000000000,
    "wavelength_str": "2.5 cm - 3.75 cm",
    "characteristics": "主要为政府、军事和科学应用保留。其较短的波长使其能够实现比低频段更高分辨率的雷达成像，并使用更小的天线。它在天气穿透能力和目标分辨率之间提供了良好的折衷，使其在监视和跟踪方面非常有效。",
    "applications": [
      "军事卫星通信 (MILSATCOM)",
      "高分辨率天气和降水雷达",
      "空中交通管制和海上船只跟踪",
      "警用测速雷达"
    ]
  },
  {
    "id": 11,
    "name": "Ku波段",
    "category": "卫星通信",
    "frequency_range_str": "12 - 18 GHz",
    "frequency_min_hz": 12000000000,
    "frequency_max_hz": 18000000000,
    "wavelength_str": "1.67 cm - 2.5 cm",
    "characteristics": "代表了许多商业卫星服务的最佳选择点，在带宽容量和天气适应性之间提供了良好的平衡。它允许使用小型、经济实惠的地面天线（VSAT），这使卫星接入大众化。它比C波段更容易受到雨衰的影响，但在恶劣天气下的表现优于Ka波段。",
    "applications": [
      "直播到户 (DTH) 卫星电视 (例如 DirecTV, Dish)",
      "消费者和企业卫星互联网",
      "卫星新闻采集 (SNG) 车",
      "企业VSAT网络"
    ]
  },
  {
    "id": 12,
    "name": "Ka波段",
    "category": "卫星通信",
    "frequency_range_str": "26.5 - 40 GHz",
    "frequency_min_hz": 26500000000,
    "frequency_max_hz": 40000000000,
    "wavelength_str": "7.5 mm - 1.1 cm",
    "characteristics": "由于其巨大的可用带宽，是现代高速卫星互联网的关键推动者。这允许非常高的数据吞吐量和使用点波束技术进行高效的频率复用。其主要挑战是来自雨水和大气条件（雨衰）的严重信号衰减，需要先进的缓解技术。",
    "applications": [
      "高通量卫星 (HTS) 宽带 (例如 Starlink, Viasat)",
      "5G蜂窝回程",
      "机上连接",
      "深空和行星际通信"
    ]
  },
  {
    "id": 13,
    "name": "Q/V波段",
    "category": "卫星通信",
    "frequency_range_str": "33 - 75 GHz",
    "frequency_min_hz": 33000000000,
    "frequency_max_hz": 75000000000,
    "wavelength_str": "4 mm - 9 mm",
    "characteristics": "被认为是卫星通信的下一个前沿，为未来的太比特每秒（Tbps）卫星提供了巨大的带宽潜力。这些频率处于当前技术的前沿，面临着来自雨衰和大气吸收的极端挑战，这些挑战可以完全阻断信号。目前，它们主要用于实验系统，并正在为下一代星座进行开发。",
    "applications": [
      "下一代超高通量卫星",
      "卫星网关的馈线链路",
      "卫星间链路",
      "科学研究和射电天文学"
    ]
  },
  {
    "id": 14,
    "name": "5G (毫米波)",
    "category": "移动通信",
    "frequency_range_str": "24.25 - 52.6 GHz",
    "frequency_min_hz": 24250000000,
    "frequency_max_hz": 52600000000,
    "wavelength_str": "5.7 mm - 1.24 cm",
    "characteristics": "5G的高频部分，提供前所未有的移动数据速度和超低延迟。“毫米波”信号的范围非常短，并且容易被建筑物、植被甚至人手等障碍物阻挡。这需要一个密集的小型蜂窝基站网络才能实现有效覆盖，使其最适合于目标高需求区域。",
    "applications": [
      "固定无线接入 (FWA) 作为家庭互联网的替代方案",
      "密集城区增强型移动宽带 (eMBB)",
      "体育场馆、机场和音乐会场馆的高容量覆盖",
      "工厂和企业园区的专用网络"
    ]
  },
  {
    "id": 15,
    "name": "6G (概念)",
    "category": "移动通信",
    "frequency_range_str": "100 GHz - 3 THz",
    "frequency_min_hz": 100000000000,
    "frequency_max_hz": 3000000000000,
    "wavelength_str": "0.1 mm - 3 mm",
    "characteristics": "预计在2030年左右出现的未来概念性移动通信标准。它旨在利用亚太赫兹和太赫兹频率，以实现高达1 Tbps的速度和微秒级的延迟。6G被设想为通信、传感、成像和人工智能的融合，创造一个完全沉浸式和智能化的数字世界。要使其成为现实，需要在材料、组件和信号处理方面取得重大技术突破。",
    "applications": [
      "全息通信和远程呈现",
      "沉浸式扩展现实 (XR)",
      "大规模数字孪生",
      "集成传感和通信网络",
      "智能反射面 (IRS)"
    ]
  },
  {
    "id": 16,
    "name": "厘米波 (SHF)",
    "category": "雷达",
    "frequency_range_str": "3 - 30 GHz",
    "frequency_min_hz": 3000000000,
    "frequency_max_hz": 30000000000,
    "wavelength_str": "1 cm - 10 cm",
    "characteristics": "一个广泛的ITU分类（超高频），覆盖从1到10厘米的波长。该范围包括广泛使用的S、C、X和Ku波段，使其对现代通信和雷达至关重要。它在雷达的探测范围、分辨率及其在各种天气条件下运作的能力之间提供了极好的平衡。",
    "applications": [
      "天气和空中交通管制雷达",
      "卫星电视广播",
      "Wi-Fi (5 GHz频段)",
      "地面点对点微波链路",
      "警用交通雷达"
    ]
  },
  {
    "id": 17,
    "name": "毫米波 (EHF)",
    "category": "雷达",
    "frequency_range_str": "30 - 300 GHz",
    "frequency_min_hz": 30000000000,
    "frequency_max_hz": 300000000000,
    "wavelength_str": "1 mm - 10 mm",
    "characteristics": "一个ITU分类（极高频），特点是波长非常短。这使得可以实现极高分辨率的成像和使用非常小的天线。虽然提供了巨大的带宽，但这些信号受到高大气吸收的影响，并且容易被障碍物阻挡，从而限制了它们的有效范围。该波段对于高频5G/6G、先进的卫星系统和汽车雷达至关重要。",
    "applications": [
      "用于ADAS和自动驾驶的汽车雷达",
      "5G和未来的6G移动网络",
      "高通量卫星通信 (Ka, Q/V波段)",
      "机场安检扫描仪",
      "射电天文学"
    ]
  },
  {
    "id": 18,
    "name": "微波",
    "category": "通用",
    "frequency_range_str": "300 MHz - 300 GHz",
    "frequency_min_hz": 300000000,
    "frequency_max_hz": 300000000000,
    "wavelength_str": "1 mm - 1 m",
    "characteristics": "一个广义术语，指频率跨越UHF、SHF和EHF波段的无线电波。它们相对较短的波长允许制造小型、高方向性的天线，从而实现高效的点对点通信和频率复用。微波是几乎所有现代无线技术的基础。",
    "applications": [
      "地面点对点回程链路",
      "卫星和空间通信",
      "雷达系统（所有类型）",
      "无线局域网 (Wi-Fi) 和广域网",
      "用于加热的微波炉"
    ]
  },
  {
    "id": 19,
    "name": "红外线 (IR)",
    "category": "通用",
    "frequency_range_str": "300 GHz - 400 THz",
    "frequency_min_hz": 300000000000,
    "frequency_max_hz": 400000000000000,
    "wavelength_str": "750 nm - 1 mm",
    "characteristics": "波长比可见光长的电磁辐射，人眼无法察觉。它用于短距离、视线范围内的通信和传感应用，因为它不能穿透不透明的物体。该波段根据波长细分为：近红外（NIR）、短波红外（SWIR）、中波红外（MWIR）、长波红外（LWIR）和远红外（FIR）。",
    "applications": [
      "电视遥控器",
      "热成像和夜视",
      "光纤通信",
      "工业热传感器",
      "天文学和气象传感"
    ]
  }
];
