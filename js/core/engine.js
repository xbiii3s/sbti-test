// ==================== 评分引擎 ====================

/**
 * 原始分转等级: <=3 → L, 4 → M, >=5 → H
 */
function sumToLevel(score) {
  if (score <= 3) return 'L';
  if (score === 4) return 'M';
  return 'H';
}

/**
 * 等级转数值: L=1, M=2, H=3
 */
function levelToNum(level) {
  return level === 'L' ? 1 : level === 'M' ? 2 : 3;
}

/**
 * 解析人格模板字符串 "HHH-HMH-MHH-HHH-MHM" → ['H','H','H','H','M','H',...]
 */
function parsePattern(pattern) {
  return pattern.replace(/-/g, '').split('');
}

/**
 * 核心计算函数
 * @param {Object} answers - { q1: 2, q2: 3, ... } 每题选择的 value
 * @param {Object} specialAnswers - { drink_gate_q1: 3, drink_gate_q2: 2 } 特殊题答案
 * @returns {Object} 完整结果
 */
function computeResult(answers, specialAnswers) {
  // 1. 检查是否触发 DRUNK
  if (specialAnswers.drink_gate_q1 === 3 && specialAnswers.drink_gate_q2 === 2) {
    // 仍然计算维度分数用于雷达图
    const dimResult = calculateDimensions(answers);
    return {
      type: TYPE_LIBRARY['DRUNK'],
      similarity: 100,
      exact: 15,
      isDrunk: true,
      rawScores: dimResult.rawScores,
      levels: dimResult.levels,
      allRanked: []
    };
  }

  // 2. 计算维度分数
  const dimResult = calculateDimensions(answers);

  // 3. 匹配人格
  const userVector = dimensionOrder.map(dim => levelToNum(dimResult.levels[dim]));

  const ranked = NORMAL_TYPES.map(type => {
    const typeVector = parsePattern(type.pattern).map(levelToNum);
    let distance = 0;
    let exact = 0;
    for (let i = 0; i < typeVector.length; i++) {
      const diff = Math.abs(userVector[i] - typeVector[i]);
      distance += diff;
      if (diff === 0) exact += 1;
    }
    const similarity = Math.max(0, Math.round((1 - distance / 30) * 100));
    return { ...TYPE_LIBRARY[type.code], pattern: type.pattern, distance, exact, similarity };
  }).sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    if (b.exact !== a.exact) return b.exact - a.exact;
    return b.similarity - a.similarity;
  });

  // 4. 判断是否触发 HHHH（傻乐者）兜底
  const bestMatch = ranked[0];
  let finalType;
  if (bestMatch.similarity < 60) {
    finalType = {
      ...TYPE_LIBRARY['HHHH'],
      similarity: bestMatch.similarity,
      exact: bestMatch.exact,
      isHHHH: true
    };
  } else {
    finalType = bestMatch;
  }

  // 5. 第二匹配人格：取排名第二且与第一不同的类型
  const secondMatch = ranked[1] ? {
    type: ranked[1],
    similarity: ranked[1].similarity,
    exact: ranked[1].exact
  } : null;

  return {
    type: finalType,
    similarity: finalType.similarity,
    exact: finalType.exact,
    isDrunk: false,
    rawScores: dimResult.rawScores,
    levels: dimResult.levels,
    allRanked: ranked.slice(0, 5),
    secondMatch: secondMatch
  };
}

/**
 * 计算 15 维原始分和等级
 */
function calculateDimensions(answers) {
  const rawScores = {};
  const levels = {};

  dimensionOrder.forEach(dim => { rawScores[dim] = 0; });

  questions.forEach(q => {
    if (answers[q.id] !== undefined) {
      rawScores[q.dim] += Number(answers[q.id]);
    }
  });

  dimensionOrder.forEach(dim => {
    levels[dim] = sumToLevel(rawScores[dim]);
  });

  return { rawScores, levels };
}
