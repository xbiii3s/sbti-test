# 核心算法文档

## 五大模型 × 15 维度

| 模型 | 维度 1 | 维度 2 | 维度 3 |
|------|--------|--------|--------|
| **自我模型** | S1 自尊自信 | S2 自我清晰度 | S3 核心价值 |
| **情感模型** | E1 依恋安全感 | E2 情感投入度 | E3 边界与依赖 |
| **态度模型** | A1 世界观倾向 | A2 规则与灵活度 | A3 人生意义感 |
| **行动驱力** | Ac1 动机导向 | Ac2 决策风格 | Ac3 执行模式 |
| **社交模型** | So1 社交主动性 | So2 人际边界感 | So3 表达与真实度 |

## 题目设计

- **30 道常规题**：每个维度 2 道题（q1-q30），每题 3 个选项，value 分别为 1、2、3
- **2 道特殊题**：用于触发隐藏的 DRUNK（酒鬼）人格
  - `drink_gate_q1`：选择"饮酒"（value=3）才会出现第 2 题
  - `drink_gate_q2`：选择"保温杯白酒"（value=2）触发 DRUNK

## 评分算法

### Step 1：原始分累加

每个维度有 2 道题，将选项 value 累加：

```
rawScore[dim] = question1.value + question2.value
范围：2（两题都选1）~ 6（两题都选3）
```

### Step 2：等级转换

```javascript
function sumToLevel(score) {
  if (score <= 3) return 'L';  // Low
  if (score === 4) return 'M';  // Medium
  return 'H';                   // High（5 或 6）
}
```

分布：L 覆盖 2-3（2种），M 覆盖 4（1种），H 覆盖 5-6（2种）

### Step 3：向量化

将等级转为数值，构成 15 维向量：

```
L = 1, M = 2, H = 3

用户向量示例：[2, 3, 2, 1, 2, 3, 3, 2, 2, 3, 2, 1, 2, 3, 2]
               S1 S2 S3 E1 E2 E3 A1 A2 A3 Ac1 Ac2 Ac3 So1 So2 So3
```

### Step 4：曼哈顿距离匹配

与 25 个标准人格模板逐一计算：

```javascript
// 模板格式："HHH-HMH-MHH-HHH-MHM" → [3,3,3,3,2,3,2,3,3,3,3,3,2,3,2]
for (let i = 0; i < 15; i++) {
  distance += Math.abs(userVector[i] - templateVector[i]);
  if (userVector[i] === templateVector[i]) exact++;
}
similarity = Math.max(0, Math.round((1 - distance / 30) * 100));
```

- **distance**：曼哈顿距离，范围 0-30（最大差值为 2×15）
- **exact**：精确命中维度数，范围 0-15
- **similarity**：相似度百分比，`(1 - distance/30) × 100`

### Step 5：排序

```
第一优先：distance 升序（越小越匹配）
第二优先：exact 降序（相同距离下命中越多越好）
第三优先：similarity 降序（兜底）
```

### Step 6：特殊人格判定

优先级从高到低：

1. **DRUNK（酒鬼）**：`drink_gate_q1 === 3 && drink_gate_q2 === 2` 时直接返回，无视其他匹配
2. **正常匹配**：取排序第一的人格，similarity >= 60%
3. **HHHH（傻乐者）**：最佳匹配 similarity < 60% 时触发，作为兜底

## 25 个标准人格模板

```
CTRL   : HHH-HMH-MHH-HHH-MHM
ATM-er : HHH-HHM-HHH-HMH-MHL
Dior-s : MHM-MMH-MHM-HMH-LHL
BOSS   : HHH-HMH-MMH-HHH-LHL
THAN-K : MHM-HMM-HHM-MMH-MHL
OH-NO  : HHL-LMH-LHH-HHM-LHL
GOGO   : HHM-HMH-MMH-HHH-MHM
SEXY   : HMH-HHL-HMM-HMM-HLH
LOVE-R : MLH-LHL-HLH-MLM-MLH
MUM    : MMH-MHL-HMM-LMM-HLL
FAKE   : HLM-MML-MLM-MLM-HLH
OJBK   : MMH-MMM-HML-LMM-MML
MALO   : MLH-MHM-MLH-MLH-LMH
JOKE-R : LLH-LHL-LML-LLL-MLM
WOC!   : HHL-HMH-MMH-HHM-LHH
THIN-K : HHL-HMH-MLH-MHM-LHH
SHIT   : HHL-HLH-LMM-HHM-LHH
ZZZZ   : MHL-MLH-LML-MML-LHM
POOR   : HHL-MLH-LMH-HHH-LHL
MONK   : HHL-LLH-LLM-MML-LHM
IMSB   : LLM-LMM-LLL-LLL-MLM
SOLO   : LML-LLH-LHL-LML-LHM
FUCK   : MLL-LHL-LLM-MLL-HLH
DEAD   : LLL-LLM-LML-LLL-LHM
IMFW   : LLH-LHL-LML-LLL-MLL
```

## 匹配示例

用户全选中间选项（value=2），每维度得 4 分，全部为 M：

```
用户向量：[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]

OJBK 模板：MMH-MMM-HML-LMM-MML
         = [2, 2, 3, 2, 2, 2, 3, 2, 1, 1, 2, 2, 2, 2, 1]

distance = |0|+|0|+|1|+|0|+|0|+|0|+|1|+|0|+|1|+|1|+|0|+|0|+|0|+|0|+|1| = 5
exact = 10
similarity = (1 - 5/30) × 100 = 83%

结果：OJBK 无所谓人，匹配度 83%
```
