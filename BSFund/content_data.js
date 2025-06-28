export const data = {
    fundBackground: `
        <p>全球精神卫生问题日益严峻，据世界卫生组织（WHO）统计，近10亿人受各类精神障碍困扰，构成巨大的公共卫生挑战与经济负担。与此同时，脑科学与神经科学的突破性进展，为精神疾病的诊断、治疗与康复带来了前所未有的机遇。</p>
        <p>在此背景下，“万联天泽精神科学产业投资基金”应运而生。本基金旨在精准把握精神健康领域的产业变革机遇，聚焦创新药物、前沿医疗器械、脑机接口、数字疗法等高增长赛道，发掘并培育具备核心技术与市场潜力的领军企业，推动中国精神科学产业的创新发展，并为投资者创造卓越回报。</p>
    `,
    partners: `
        <h4>战略合作方</h4>
        <p>基金依托主要发起方<strong>粤万年青</strong>的产业资源与<strong>广州金控</strong>的资本优势，实现“产业+资本”的深度融合，为被投企业提供市场渠道、政策支持、后续融资等多维度赋能，构建强大的产业生态系统。</p>
    `,
    fundManager: {
        name: "万联天泽资本投资有限公司",
        imageUrl: "https://image.qcc.com/logo/f7d7c5c5443bf81212e76fd067d71ec0.jpg?x-oss-process=style/logo_s",
        description: `
            <p>万联天泽资本投资有限公司是万联证券旗下的专业私募股权投资平台。公司核心团队由具备深厚产业背景、丰富投资经验及强大资本运作能力的专业人士组成。团队专注于医疗健康、硬核科技等战略性新兴产业，致力于发掘价值、赋能创新，与优秀企业家携手，共同打造行业龙头。</p>
        `
    },
    charts: {
        patientDistribution: {
            labels: ['焦虑障碍', '抑郁障碍', '阿尔兹海默症', '精神分裂症', '双相情感障碍', '其他'],
            datasets: [{
                data: [301, 280, 55, 24, 40, 280],
                backgroundColor: ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#64748b'],
                borderColor: '#1f2937',
                borderWidth: 2,
            }]
        },
        economicBurden: {
            labels: ['2019', '2025(E)', '2030(E)'],
            datasets: [{
                label: '经济负担',
                data: [6.0, 8.5, 11.2],
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        }
    },
    projects: [
        {
            id: 'hongchen',
            name: '泓宸生物',
            summary: '领先的iPSC（诱导性多能干细胞）技术平台，专注于开发用于神经系统疾病的细胞治疗药物。',
            imageUrl: 'https://pharmcube-bydrug.oss-cn-beijing.aliyuncs.com/info/message_cn_img/a80dd48a45ac756b4dc6dfac1009d193.png',
            details: `
                <h4>核心技术</h4>
                <p>泓宸生物拥有国际领先的iPSC重编程、基因编辑和定向诱导分化技术，能够高效、稳定地制备功能性神经细胞，为帕金森症、阿尔兹海默症等神经退行性疾病提供革命性的细胞替代疗法。</p>
                <h4>市场前景</h4>
                <p>细胞治疗是再生医学的前沿，尤其在传统药物难以治愈的神经系统疾病领域展现出巨大潜力。公司管线内的核心产品已进入临床前研究阶段，市场空间广阔。</p>
            `
        },
        {
            id: 'ruidi',
            name: '睿笛科技',
            summary: '专注于脉冲电场（PSE）肿瘤消融技术和脑机接口（BCI）技术的创新医疗科技公司。',
            imageUrl: 'https://pharmcube-bydrug.oss-cn-beijing.aliyuncs.com/info/message_cn_img/5efcdb518d51e11f007c1d628bf3194c.png',
            details: `
                <h4>核心技术</h4>
                <p>睿笛科技在纳秒级脉冲电场消融技术上取得突破，为实体瘤治疗提供了非热、精准的微创解决方案。同时，公司积极布局脑机接口领域，研发用于神经康复和功能重建的侵入式BCI系统。</p>
                <h4>竞争优势</h4>
                <p>其肿瘤消融技术具有手术时间短、恢复快、对周围组织损伤小的优点。脑机接口产品则瞄准了残障人士功能替代和神经调控等未来医疗的核心需求。</p>
            `
        },
        {
            id: 'baihuiweikang',
            name: '柏惠维康',
            summary: '国内神经外科手术机器人领域的开拓者和领导者，其“睿米”手术机器人已广泛应用于临床。',
            imageUrl: 'https://www.remebot.com.cn/img/0141.jpg',
            details: `
                <h4>核心产品</h4>
                <p>“睿米”（Remebot）神经外科手术机器人，是国内首款正式获批的同类产品。它能够辅助医生完成高精度的微创手术，如脑出血、帕金森DBS电极植入等，显著提高手术精准度和安全性。</p>
                <h4>市场地位</h4>
                <p>作为行业标杆，柏惠维康已在国内数百家顶级医院实现装机，并建立了完善的培训和技术支持体系，品牌护城河效应显著。</p>
            `
        },
        {
            id: 'jingzhun',
            name: '精准医械',
            summary: '专注于精神心理疾病物理治疗设备研发，特别是经颅磁刺激（TMS）技术的创新与应用。',
            imageUrl: 'https://cdn.vcbeat.top/upload/entity/logo/420af77e1e3562905f8397cc554c67b5.png',
            details: `
                <h4>核心技术</h4>
                <p>公司研发的新一代磁-电联合刺激系统，结合了rTMS的无创性和tDCS的便携性，并引入个性化刺激方案算法，旨在为抑郁症、焦虑症、失眠等疾病提供更高效、副作用更小的治疗选择。</p>
                <h4>市场前景</h4>
                <p>随着对精神疾病生物学机制认识的加深，物理治疗方法正快速兴起。精准医械的产品覆盖院内专业市场和家用康复市场，潜力巨大。</p>
            `
        },
        {
            id: 'diehe',
            name: '蝶和智能',
            summary: '全球领先的康复机器人解决方案提供商，其下肢康复机器人Lokomat享有盛誉。',
            imageUrl: 'https://pic.imgdb.cn/item/637f717716f2c2beb127867a.jpg',
            details: `
                <h4>核心产品</h4>
                <p>Lokomat系列下肢康复机器人通过任务导向性训练，帮助中风、脊髓损伤等神经损伤患者重建行走能力。其产品融合了机器人技术、虚拟现实和生物反馈，是智能康复领域的黄金标准。</p>
                <h4>竞争优势</h4>
                <p>蝶和智能（代理Hocoma产品）拥有强大的品牌效应和技术壁垒，产品遍布全球顶级康复中心，并建立了基于大数据的个性化康复方案平台。</p>
            `
        },
        {
            id: 'shenxi',
            name: '神曦生物',
            summary: '开创性的神经再生基因疗法公司，通过将脑内胶质细胞原位转化为功能性神经元来治疗神经系统疾病。',
            imageUrl: 'https://www.neuexcellcn.com/themes/cn/default/assets/images/logo.png?s',
            details: `
                <h4>核心技术</h4>
                <p>基于陈功教授团队的突破性研究，神曦生物开发了世界领先的NeuroD1/PTBP1等关键转录因子的AAV基因治疗技术，实现了在体神经再生，为脑损伤、帕金森症、亨廷顿舞蹈症等带来治愈希望。</p>
                <h4>里程碑</h4>
                <p>公司已有多个管线进入临床前和临床研究阶段，其颠覆性的技术平台吸引了全球顶尖的科研人才和投资机构。</p>
            `
        },
        {
            id: 'tuten',
            name: '途滕科技',
            summary: '专注于为医疗行业提供高性能云计算与大数据解决方案的科技公司，保障医疗数据的安全与高效流转。',
            imageUrl: 'https://bkimg.cdn.bcebos.com/smart/9922720e0cf3d7ca6a482b02fd1fbe096b63a903-bkimg-process,v_1,rw_1,rh_1,pad_1,color_ffffff?x-bce-process=image/format,f_auto',
            details: `
                <h4>核心业务</h4>
                <p>途滕科技（云途腾）为医院、科研机构及数字疗法平台提供符合医疗行业监管要求的私有云、混合云部署方案，以及医学影像、基因测序等场景的大数据处理与分析服务。</p>
                <h4>价值定位</h4>
                <p>在精神健康产业数字化转型浪潮中，途滕科技是关键的基础设施提供商，其技术实力是连接数据、算法与临床应用的重要桥梁。</p>
            `
        },
        {
            id: 'ximang',
            name: '析芒医疗',
            summary: '致力于研发新一代柔性、高通量脑机接口电极及神经信号处理系统的硬核科技企业。',
            imageUrl: 'https://res.cloudinary.com/tia-img/image/fetch/t_company_avatar/https%3A%2F%2Fcdn.techinasia.com%2Fdata%2Fimages%2FUsP3zpmox5o6Ybs2dgdZ55Fs3KjWkkcIelvyO6Ze.png',
            details: `
                <h4>核心技术</h4>
                <p>析芒医疗采用先进的微纳加工技术和柔性材料，开发出生物相容性高、植入创伤小、信号采集能力强的微电极阵列。其核心优势在于电极的长期在体稳定性与高信噪比。</p>
                <h4>应用领域</h4>
                <p>产品主要应用于科研领域的神经科学研究，并积极布局医疗领域的癫痫灶定位、神经功能重建等临床应用，是脑机接口上游核心器件的关键参与者。</p>
            `
        },
        {
            id: 'haoxinqing',
            name: '好心情',
            summary: '国内领先的精神心理医疗健康服务平台，提供线上问诊、数字疗法、心理咨询等一体化服务。',
            imageUrl: 'https://bkimg.cdn.bcebos.com/smart/c2cec3fdfc039245d688eb43f2c3b3c27d1ed21b8f7a-bkimg-process,v_1,rw_1,rh_1,pad_1,color_ffffff?x-bce-process=image/format,f_auto',
            details: `
                <h4>商业模式</h4>
                <p>“好心情”平台连接了全国大量的精神科医生和心理咨询师，通过“互联网医院+SaaS服务”模式，为用户提供便捷、私密的心理健康解决方案。同时，公司开发了多款基于CBT（认知行为疗法）的数字疗法产品。</p>
                <h4>市场地位</h4>
                <p>作为该领域的头部平台，好心情已积累了海量用户和医生资源，数据和品牌优势明显，是精神健康服务数字化的重要入口。</p>
            `
        }
    ]
};
