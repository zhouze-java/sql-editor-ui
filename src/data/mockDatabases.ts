import { DatabaseEnv, QuerySnippet, QueryResult } from '../types/sql';

export const INITIAL_DATABASES: DatabaseEnv[] = [
  {
    id: 'shiyipre',
    name: '试医预发',
    code: 'shiyipre',
    env: 'pre',
    host: '10.128.4.12',
    port: 3306,
    databaseName: 'ebei_hospital_shiyipre',
    pingMs: 24,
    description: '预发布多活集群 · 杭州主节点',
    tables: [
      {
        name: 'base_hospital_area_info',
        comment: '医院院区基础档案信息表',
        estimatedRows: 4,
        columns: [
          { name: 'id', type: 'bigint(20)', isPrimary: true, nullable: false, comment: '自增主键', defaultValue: null },
          { name: 'hospital_area_id', type: 'varchar(64)', nullable: false, comment: '院区唯一业务编码UUID', defaultValue: null },
          { name: 'hospital_area_parent_id', type: 'varchar(64)', nullable: true, comment: '上级总院区编码', defaultValue: null },
          { name: 'hospital_area_name', type: 'varchar(128)', nullable: false, comment: '院区标准名称', defaultValue: null },
          { name: 'hospital_area_name_py', type: 'varchar(64)', nullable: true, comment: '院区拼音助记码', defaultValue: null },
          { name: 'hospital_area_name_wb', type: 'varchar(64)', nullable: true, comment: '院区五笔助记码', defaultValue: null },
          { name: 'hospital_area_status', type: 'tinyint(1)', nullable: false, comment: '院区启用状态(0禁用 1启用)', defaultValue: '1' },
          { name: 'hospital_area_sort', type: 'int(11)', nullable: true, comment: '展示排序序号', defaultValue: '0' },
          { name: 'hospital_id', type: 'varchar(64)', nullable: false, comment: '所属医院主体统一编码', defaultValue: null },
          { name: 'general_hospital', type: 'tinyint(1)', nullable: false, comment: '是否总院(0分院 1总院)', defaultValue: '1' },
          { name: 'add_by', type: 'varchar(64)', nullable: true, comment: '创建人编码', defaultValue: null },
          { name: 'add_name', type: 'varchar(64)', nullable: true, comment: '创建人姓名', defaultValue: null },
          { name: 'add_time', type: 'datetime', nullable: true, comment: '创建时间戳', defaultValue: 'CURRENT_TIMESTAMP' },
          { name: 'upd_by', type: 'varchar(64)', nullable: true, comment: '最后更新人编码', defaultValue: null },
          { name: 'upd_name', type: 'varchar(64)', nullable: true, comment: '最后更新人姓名', defaultValue: null },
          { name: 'upd_time', type: 'datetime', nullable: true, comment: '最后更新时间', defaultValue: null },
        ]
      },
      {
        name: 'base_department_info',
        comment: '医院临床与医技科室字典',
        estimatedRows: 48,
        columns: [
          { name: 'dept_id', type: 'varchar(64)', isPrimary: true, nullable: false, comment: '科室编码', defaultValue: null },
          { name: 'dept_name', type: 'varchar(100)', nullable: false, comment: '科室名称', defaultValue: null },
          { name: 'hospital_area_id', type: 'varchar(64)', nullable: false, comment: '所属院区编码', defaultValue: null },
          { name: 'dept_category', type: 'varchar(32)', nullable: false, comment: '科室类别(内科/外科/医技)', defaultValue: null },
          { name: 'is_emergency', type: 'tinyint(1)', nullable: false, comment: '是否急诊科室', defaultValue: '0' },
          { name: 'status', type: 'tinyint(1)', nullable: false, comment: '启用状态', defaultValue: '1' },
          { name: 'create_time', type: 'datetime', nullable: true, comment: '创建时间', defaultValue: 'CURRENT_TIMESTAMP' },
        ]
      },
      {
        name: 'base_doctor_info',
        comment: '医生职级与电子档案',
        estimatedRows: 312,
        columns: [
          { name: 'doctor_id', type: 'varchar(64)', isPrimary: true, nullable: false, comment: '医生唯一工号', defaultValue: null },
          { name: 'doctor_name', type: 'varchar(64)', nullable: false, comment: '医生姓名', defaultValue: null },
          { name: 'dept_id', type: 'varchar(64)', nullable: false, comment: '所属科室编码', defaultValue: null },
          { name: 'job_title', type: 'varchar(64)', nullable: false, comment: '职称(主任医师/副主任/主治)', defaultValue: null },
          { name: 'is_expert', type: 'tinyint(1)', nullable: false, comment: '是否专家号', defaultValue: '0' },
          { name: 'phone', type: 'varchar(20)', nullable: true, comment: '脱敏联系电话', defaultValue: null },
          { name: 'status', type: 'tinyint(1)', nullable: false, comment: '在职执业状态', defaultValue: '1' },
        ]
      },
      {
        name: 'patient_appointment_record',
        comment: '门诊预约与挂号流水表',
        estimatedRows: 1420,
        columns: [
          { name: 'appt_id', type: 'varchar(64)', isPrimary: true, nullable: false, comment: '预约挂号单号', defaultValue: null },
          { name: 'patient_name', type: 'varchar(64)', nullable: false, comment: '患者姓名(已脱敏)', defaultValue: null },
          { name: 'id_card_hash', type: 'varchar(64)', nullable: false, comment: '身份证哈希加密', defaultValue: null },
          { name: 'dept_name', type: 'varchar(64)', nullable: false, comment: '挂号科室', defaultValue: null },
          { name: 'doctor_name', type: 'varchar(64)', nullable: false, comment: '出诊医师', defaultValue: null },
          { name: 'visit_date', type: 'date', nullable: false, comment: '就诊日期', defaultValue: null },
          { name: 'time_period', type: 'varchar(20)', nullable: false, comment: '时段(上午/下午/夜门诊)', defaultValue: null },
          { name: 'fee', type: 'decimal(10,2)', nullable: false, comment: '挂号费(元)', defaultValue: '0.00' },
          { name: 'appt_status', type: 'varchar(32)', nullable: false, comment: '状态(已取号/就诊中/已结算)', defaultValue: null },
        ]
      },
      {
        name: 'med_prescription_order',
        comment: '电子处方与药品调配明细',
        estimatedRows: 860,
        columns: [
          { name: 'prescription_no', type: 'varchar(64)', isPrimary: true, nullable: false, comment: '处方编号', defaultValue: null },
          { name: 'appt_id', type: 'varchar(64)', nullable: false, comment: '关联门诊挂号单', defaultValue: null },
          { name: 'diagnosis', type: 'varchar(255)', nullable: false, comment: '初步临床诊断', defaultValue: null },
          { name: 'drug_items_count', type: 'int(11)', nullable: false, comment: '药品品规数', defaultValue: '1' },
          { name: 'total_amount', type: 'decimal(10,2)', nullable: false, comment: '处方总金额', defaultValue: '0.00' },
          { name: 'audit_status', type: 'varchar(32)', nullable: false, comment: '药师双审状态(审核通过/待审)', defaultValue: null },
          { name: 'create_time', type: 'datetime', nullable: false, comment: '开方时间', defaultValue: 'CURRENT_TIMESTAMP' },
        ]
      }
    ]
  },
  {
    id: 'test_fy',
    name: '测试医院(安庆)',
    code: 'test.fy',
    env: 'test',
    host: '10.128.4.22',
    port: 3306,
    databaseName: 'ebei_hospital_anqing_test',
    pingMs: 38,
    description: '华东区域测试专区 · 安庆院区镜像',
    tables: [
      {
        name: 'base_hospital_area_info',
        comment: '医院院区基础档案信息表',
        estimatedRows: 2,
        columns: [
          { name: 'id', type: 'bigint(20)', isPrimary: true, nullable: false, comment: '自增主键', defaultValue: null },
          { name: 'hospital_area_id', type: 'varchar(64)', nullable: false, comment: '院区唯一业务编码', defaultValue: null },
          { name: 'hospital_area_name', type: 'varchar(128)', nullable: false, comment: '院区标准名称', defaultValue: null },
          { name: 'hospital_area_status', type: 'tinyint(1)', nullable: false, comment: '启用状态', defaultValue: '1' },
          { name: 'hospital_id', type: 'varchar(64)', nullable: false, comment: '所属医院主体', defaultValue: null },
          { name: 'general_hospital', type: 'tinyint(1)', nullable: false, comment: '是否总院', defaultValue: '1' },
        ]
      },
      {
        name: 'base_department_info',
        comment: '医院临床与医技科室字典',
        estimatedRows: 26,
        columns: [
          { name: 'dept_id', type: 'varchar(64)', isPrimary: true, nullable: false, comment: '科室编码', defaultValue: null },
          { name: 'dept_name', type: 'varchar(100)', nullable: false, comment: '科室名称', defaultValue: null },
          { name: 'status', type: 'tinyint(1)', nullable: false, comment: '启用状态', defaultValue: '1' },
        ]
      }
    ]
  },
  {
    id: 'hz1_prod',
    name: '浙大一院(庆春院区)',
    code: 'hz1.prod',
    env: 'prod',
    host: '172.16.80.10',
    port: 3306,
    databaseName: 'ebei_hospital_hz1_prod',
    pingMs: 12,
    description: '核心生产集群 · 仅支持只读 SELECT',
    tables: [
      {
        name: 'base_hospital_area_info',
        comment: '医院院区基础档案信息表',
        estimatedRows: 6,
        columns: [
          { name: 'id', type: 'bigint(20)', isPrimary: true, nullable: false, comment: '自增主键', defaultValue: null },
          { name: 'hospital_area_id', type: 'varchar(64)', nullable: false, comment: '院区编码', defaultValue: null },
          { name: 'hospital_area_name', type: 'varchar(128)', nullable: false, comment: '院区名称', defaultValue: null },
        ]
      }
    ]
  }
];

// Exact mock dataset reflecting the user screenshot
export const TABLE_DATA_STORE: Record<string, Record<string, any[]>> = {
  shiyipre: {
    base_hospital_area_info: [
      {
        id: 1,
        hospital_area_id: '08E7E87031414E0AB9A127DE9D56A146',
        hospital_area_parent_id: '08E7E87031414E0AB9A127DE9D56A146',
        hospital_area_name: '浙江省杭州市第一人民医院',
        hospital_area_name_py: null,
        hospital_area_name_wb: null,
        hospital_area_status: false,
        hospital_area_sort: null,
        hospital_id: 'd132a63484a84513836f7315edc605ca',
        general_hospital: true,
        add_by: '76EC0211649E47978FB2D3074F6D1E92',
        add_name: '系统',
        add_time: '2024-03-12 10:24:18',
        upd_by: '76EC0211649E47978FB2D3074F6D1E92',
        upd_name: '超级管理员',
        upd_time: '2024-11-05 18:02:44'
      },
      {
        id: 2,
        hospital_area_id: '5F2C89A127DE9D56A14608E7E8703141',
        hospital_area_parent_id: '08E7E87031414E0AB9A127DE9D56A146',
        hospital_area_name: '杭州市第一人民医院(城北院区)',
        hospital_area_name_py: 'HZSCDYRM',
        hospital_area_name_wb: 'SGYA',
        hospital_area_status: true,
        hospital_area_sort: 2,
        hospital_id: 'd132a63484a84513836f7315edc605ca',
        general_hospital: false,
        add_by: '76EC0211649E47978FB2D3074F6D1E92',
        add_name: '系统',
        add_time: '2024-06-15 09:12:00',
        upd_by: null,
        upd_name: null,
        upd_time: null
      },
      {
        id: 3,
        hospital_area_id: '9C3484A84513836F7315EDC605CA1102',
        hospital_area_parent_id: '08E7E87031414E0AB9A127DE9D56A146',
        hospital_area_name: '杭州市第一人民医院(钱塘院区)',
        hospital_area_name_py: 'HZSCDYRM',
        hospital_area_name_wb: 'SGYA',
        hospital_area_status: true,
        hospital_area_sort: 3,
        hospital_id: 'd132a63484a84513836f7315edc605ca',
        general_hospital: false,
        add_by: '8092B00174F6D1E9276EC0211649E479',
        add_name: '院区接口同步',
        add_time: '2024-08-20 14:33:51',
        upd_by: null,
        upd_name: null,
        upd_time: null
      }
    ],
    base_department_info: [
      { dept_id: 'DEP001', dept_name: '心血管内科门诊', hospital_area_id: '08E7E87031414E0AB9A127DE9D56A146', dept_category: '临床内科', is_emergency: 0, status: 1, create_time: '2024-01-10 08:30:00' },
      { dept_id: 'DEP002', dept_name: '神经外科专家诊室', hospital_area_id: '08E7E87031414E0AB9A127DE9D56A146', dept_category: '临床外科', is_emergency: 0, status: 1, create_time: '2024-01-10 08:32:00' },
      { dept_id: 'DEP003', dept_name: '急诊医学科(抢救室)', hospital_area_id: '08E7E87031414E0AB9A127DE9D56A146', dept_category: '急诊医学', is_emergency: 1, status: 1, create_time: '2024-01-10 08:35:00' },
      { dept_id: 'DEP004', dept_name: '消化内科内镜中心', hospital_area_id: '08E7E87031414E0AB9A127DE9D56A146', dept_category: '医技平台', is_emergency: 0, status: 1, create_time: '2024-01-11 11:20:00' },
      { dept_id: 'DEP005', dept_name: '呼吸与危重症医学科', hospital_area_id: '5F2C89A127DE9D56A14608E7E8703141', dept_category: '临床内科', is_emergency: 0, status: 1, create_time: '2024-01-12 09:15:00' }
    ],
    base_doctor_info: [
      { doctor_id: 'DOC8801', doctor_name: '张明辉', dept_id: 'DEP001', job_title: '主任医师', is_expert: 1, phone: '138****9281', status: 1 },
      { doctor_id: 'DOC8802', doctor_name: '林建国', dept_id: 'DEP002', job_title: '副主任医师', is_expert: 1, phone: '139****4412', status: 1 },
      { doctor_id: 'DOC8803', doctor_name: '陈若愚', dept_id: 'DEP001', job_title: '主治医师', is_expert: 0, phone: '137****1102', status: 1 },
      { doctor_id: 'DOC8804', doctor_name: '徐素华', dept_id: 'DEP003', job_title: '副主任医师', is_expert: 1, phone: '135****8876', status: 1 },
      { doctor_id: 'DOC8805', doctor_name: '王晨阳', dept_id: 'DEP004', job_title: '主治医师', is_expert: 0, phone: '180****6631', status: 1 }
    ],
    patient_appointment_record: [
      { appt_id: 'AP202610200001', patient_name: '王*强', id_card_hash: 'e9b2...84af', dept_name: '心血管内科门诊', doctor_name: '张明辉', visit_date: '2026-10-20', time_period: '上午09:00-09:30', fee: 50.00, appt_status: '就诊中' },
      { appt_id: 'AP202610200002', patient_name: '李*芳', id_card_hash: '4d1c...3319', dept_name: '神经外科专家诊室', doctor_name: '林建国', visit_date: '2026-10-20', time_period: '上午10:00-10:30', fee: 50.00, appt_status: '已结算' },
      { appt_id: 'AP202610200003', patient_name: '张*伟', id_card_hash: '8f0a...99e1', dept_name: '呼吸与危重症医学科', doctor_name: '徐素华', visit_date: '2026-10-20', time_period: '下午14:00-14:30', fee: 18.00, appt_status: '已预约' },
      { appt_id: 'AP202610200004', patient_name: '赵*敏', id_card_hash: '1b22...c774', dept_name: '消化内科内镜中心', doctor_name: '王晨阳', visit_date: '2026-10-21', time_period: '上午08:30-09:00', fee: 18.00, appt_status: '已预约' }
    ],
    med_prescription_order: [
      { prescription_no: 'RX9820241001', appt_id: 'AP202610200001', diagnosis: '高血压病3级(很高危)', drug_items_count: 3, total_amount: 148.60, audit_status: '审核通过', create_time: '2026-10-20 09:28:15' },
      { prescription_no: 'RX9820241002', appt_id: 'AP202610200002', diagnosis: '偏头痛综合征', drug_items_count: 2, total_amount: 92.40, audit_status: '审核通过', create_time: '2026-10-20 10:18:40' }
    ]
  },
  test_fy: {
    base_hospital_area_info: [
      {
        id: 1,
        hospital_area_id: 'ANQING_MAIN_001',
        hospital_area_name: '安庆市立医院(南院区)',
        hospital_area_status: true,
        hospital_id: 'AQ_HOSP_001',
        general_hospital: true
      },
      {
        id: 2,
        hospital_area_id: 'ANQING_NEW_002',
        hospital_area_name: '安庆市立医院(新院区)',
        hospital_area_status: true,
        hospital_id: 'AQ_HOSP_001',
        general_hospital: false
      }
    ],
    base_department_info: [
      { dept_id: 'AQ_D01', dept_name: '安庆普外科', status: 1 },
      { dept_id: 'AQ_D02', dept_name: '安庆骨科', status: 1 },
      { dept_id: 'AQ_D03', dept_name: '安庆儿科', status: 1 }
    ]
  },
  hz1_prod: {
    base_hospital_area_info: [
      { id: 1, hospital_area_id: 'HZ1_QINGCHUN_001', hospital_area_name: '浙江大学医学院附属第一医院(庆春总院区)' },
      { id: 2, hospital_area_id: 'HZ1_YUHANG_002', hospital_area_name: '浙江大学医学院附属第一医院(余杭院区)' },
      { id: 3, hospital_area_id: 'HZ1_ZHITONG_003', hospital_area_name: '浙江大学医学院附属第一医院(总部一期)' }
    ]
  }
};

export const QUERY_SNIPPETS: QuerySnippet[] = [
  {
    id: 's1',
    title: '院区档案全表查询',
    category: '基础表查询',
    sql: 'SELECT * from base_hospital_area_info;',
    description: '查看当前医院维护的所有院区、分院与编码映射'
  },
  {
    id: 's2',
    title: '在职专家与科室联合查询',
    category: '基础表查询',
    sql: 'SELECT d.doctor_id, d.doctor_name, d.job_title, dep.dept_name, dep.dept_category\nFROM base_doctor_info d\nLEFT JOIN base_department_info dep ON d.dept_id = dep.dept_id\nWHERE d.is_expert = 1 AND d.status = 1;',
    description: '关联医生表与科室字典，筛选在职的专家级主治/主任医师'
  },
  {
    id: 's3',
    title: '今日各科室就诊人次汇总统计',
    category: '统计汇总',
    sql: 'SELECT dept_name, count(*) as appointment_count, sum(fee) as total_fee\nFROM patient_appointment_record\nGROUP BY dept_name\nORDER BY appointment_count DESC;',
    description: '按就诊科室分组聚合挂号预约总量及挂号费收缴总计'
  },
  {
    id: 's4',
    title: '院区状态异常或未启用记录排查',
    category: '性能与排查',
    sql: 'SELECT id, hospital_area_id, hospital_area_name, hospital_area_status, upd_name, upd_time\nFROM base_hospital_area_info\nWHERE hospital_area_status = false OR hospital_area_status IS NULL;',
    description: '快速定位被禁用、草稿态或状态标记为 false 的院区'
  },
  {
    id: 's5',
    title: '慢查询/长处方订单抽检',
    category: '性能与排查',
    sql: 'SELECT prescription_no, appt_id, diagnosis, drug_items_count, total_amount, audit_status\nFROM med_prescription_order\nWHERE total_amount > 100.00\nORDER BY total_amount DESC\nLIMIT 20;',
    description: '检查大额电子处方及药师双审执行状态'
  }
];

// Helper to execute query against mock dataset with simulated network + internal latency
export async function executeSqlQuery(
  database: DatabaseEnv,
  sql: string,
  params: { maxRows: number; timeoutMs: number; queryCount: boolean }
): Promise<QueryResult> {
  const trimmed = sql.trim().replace(/;+$/, '');
  const startTime = performance.now();

  // Simulate network delay based on hospital environment
  const simulatedInternalMs = Math.floor(180 + Math.random() * 50); // ~209ms like screenshot
  const simulatedGatewayMs = Math.floor(70 + Math.random() * 30);   // ~82ms
  const waitMs = Math.min(params.timeoutMs, simulatedInternalMs + simulatedGatewayMs);

  await new Promise((resolve) => setTimeout(resolve, waitMs));

  const totalDuration = Math.round(performance.now() - startTime);

  // Safety check: block write queries if in prod environment unless confirmed
  if (database.env === 'prod' && /^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE)/i.test(trimmed)) {
    return {
      status: 'error',
      columns: [],
      rows: [],
      durationMs: totalDuration,
      internalMs: simulatedInternalMs,
      gatewayMs: simulatedGatewayMs,
      error: `[PROD_SAFE_MODE_DENIED] 生产环境 ${database.name} (${database.code}) 已开启严格只读保护，禁止执行写入或修改指令！`,
      executedSql: sql,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      hospitalName: database.name,
      hospitalCode: database.code
    };
  }

  // Parse simple SELECT statement
  const dbData = TABLE_DATA_STORE[database.id] || TABLE_DATA_STORE['shiyipre'];
  
  // Try to find targeted table in query
  const tableNameMatch = trimmed.match(/(?:from|join)\s+([a-zA-Z0-9_]+)/i);
  const matchedTable = tableNameMatch ? tableNameMatch[1].toLowerCase() : null;

  if (matchedTable && dbData[matchedTable]) {
    let dataset = [...dbData[matchedTable]];

    // If query has WHERE condition
    if (/where\s+/i.test(trimmed)) {
      if (/hospital_area_status\s*=\s*(false|0)/i.test(trimmed)) {
        dataset = dataset.filter(r => r.hospital_area_status === false || r.hospital_area_status === 0);
      } else if (/is_expert\s*=\s*1/i.test(trimmed)) {
        dataset = dataset.filter(r => r.is_expert === 1);
      } else if (/total_amount\s*>\s*100/i.test(trimmed)) {
        dataset = dataset.filter(r => Number(r.total_amount) > 100);
      }
    }

    // If query has GROUP BY / Aggregation
    if (/count\(\*\)/i.test(trimmed) && /group by/i.test(trimmed)) {
      const groupMatch = trimmed.match(/group by\s+([a-zA-Z0-9_]+)/i);
      const groupCol = groupMatch ? groupMatch[1] : 'dept_name';
      const map: Record<string, { count: number; feeTotal: number }> = {};
      dataset.forEach(row => {
        const val = row[groupCol] ?? '未知';
        if (!map[val]) map[val] = { count: 0, feeTotal: 0 };
        map[val].count += 1;
        map[val].feeTotal += Number(row.fee || 0);
      });
      const rows = Object.entries(map).map(([k, v]) => ({
        [groupCol]: k,
        appointment_count: v.count,
        total_fee: v.feeTotal.toFixed(2)
      }));
      return {
        status: 'success',
        columns: Object.keys(rows[0] || { [groupCol]: '', appointment_count: 0, total_fee: 0 }),
        rows: rows.slice(0, params.maxRows),
        durationMs: totalDuration,
        internalMs: simulatedInternalMs,
        gatewayMs: simulatedGatewayMs,
        totalCount: rows.length,
        executedSql: sql,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        hospitalName: database.name,
        hospitalCode: database.code
      };
    }

    // Apply maxRows limit
    const finalRows = dataset.slice(0, params.maxRows);
    const columns = finalRows.length > 0 
      ? Object.keys(finalRows[0])
      : (database.tables.find(t => t.name.toLowerCase() === matchedTable)?.columns.map(c => c.name) || ['id', 'status']);

    return {
      status: 'success',
      columns,
      rows: finalRows,
      durationMs: totalDuration,
      internalMs: simulatedInternalMs,
      gatewayMs: simulatedGatewayMs,
      totalCount: params.queryCount ? dataset.length : undefined,
      executedSql: sql,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      hospitalName: database.name,
      hospitalCode: database.code
    };
  }

  // Handle SHOW TABLES / SELECT VERSION() / generic queries
  if (/^show\s+tables/i.test(trimmed)) {
    const tableRows = database.tables.map((t, idx) => ({
      [`Tables_in_${database.databaseName}`]: t.name,
      Table_type: 'BASE TABLE',
      Remarks: t.comment,
      Estimated_Rows: t.estimatedRows
    }));
    return {
      status: 'success',
      columns: [`Tables_in_${database.databaseName}`, 'Table_type', 'Remarks', 'Estimated_Rows'],
      rows: tableRows,
      durationMs: totalDuration,
      internalMs: simulatedInternalMs,
      gatewayMs: simulatedGatewayMs,
      totalCount: tableRows.length,
      executedSql: sql,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      hospitalName: database.name,
      hospitalCode: database.code
    };
  }

  // If table not found in mock store, return helpful SQL error
  return {
    status: 'error',
    columns: [],
    rows: [],
    durationMs: totalDuration,
    internalMs: simulatedInternalMs,
    gatewayMs: simulatedGatewayMs,
    error: `Error Code: 1146. Table '${database.databaseName}.${matchedTable || 'unknown'}' doesn't exist in current hospital cluster. 可用表: ${database.tables.map(t => t.name).join(', ')}`,
    executedSql: sql,
    timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
    hospitalName: database.name,
    hospitalCode: database.code
  };
}
