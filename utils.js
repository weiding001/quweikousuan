/**
 * 趣味口算应用 - 公共工具函数库
 * 包含应用中共享的各种功能函数
 */

/**
 * 获取用户统计数据
 * 从localStorage中读取用户的统计数据，如果不存在则返回默认值
 * @returns {Object} 用户统计数据对象
 */
function getUserStats() {
    const stats = localStorage.getItem('mathUserStats');
    if (!stats) {
        // 默认统计数据
        return {
            totalPractices: 0, // 总练习次数
            totalProblems: 0, // 总题目数
            totalCorrect: 0, // 总正确题数
            highestScore: 0, // 最高成绩
            fastestAvgTime: Infinity, // 最快平均时间（秒）
            currentStreak: 0, // 当前连续天数
            maxStreak: 0, // 最大连续天数
            lastPracticeDate: null, // 最后练习日期
            hardModeHighScore: 0, // 困难模式最高分
            reviewedMistakes: 0, // 复习的错题数量
            masteredMistakes: 0, // 已掌握的错题数量
            usedOperations: [], // 使用过的运算符
            unlockedAchievements: [] // 已解锁的成就ID
        };
    }
    return JSON.parse(stats);
}

/**
 * 保存用户统计数据
 * 将用户统计数据保存到localStorage
 * @param {Object} stats - 用户统计数据对象
 */
function saveUserStats(stats) {
    localStorage.setItem('mathUserStats', JSON.stringify(stats));
}

/**
 * 获取当前难度设置
 * 从localStorage中读取用户设置的难度级别
 * @returns {string} 难度级别（简单/中等/困难）
 */
function getDifficulty() {
    return localStorage.getItem('mathDifficulty') || '中等'; // 默认中等难度
}

/**
 * 格式化时间显示
 * 将秒数转换为分:秒格式
 * @param {number} seconds - 要格式化的秒数
 * @returns {string} 格式化后的时间字符串（MM:SS）
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}

/**
 * 获取错题本数据
 * 从localStorage中读取用户的错题记录
 * @returns {Array} 错题记录数组
 */
function getMistakes() {
    const mistakes = localStorage.getItem('mathMistakes');
    return mistakes ? JSON.parse(mistakes) : [];
}

/**
 * 添加错题到错题本
 * @param {string} question - 题目内容
 * @param {number} correctAnswer - 正确答案
 * @param {number} userAnswer - 用户的答案
 */
function addToMistakes(question, correctAnswer, userAnswer) {
    const mistakes = getMistakes();
    
    // 创建错题对象
    const mistake = {
        id: Date.now().toString(), // 使用时间戳作为唯一ID
        question: question,
        correctAnswer: correctAnswer,
        userAnswer: userAnswer,
        difficulty: getDifficulty(),
        timestamp: new Date().toISOString(),
        attempts: 1,
        mastered: false
    };
    
    // 检查是否已存在相同题目的错题
    const existingIndex = mistakes.findIndex(m => m.question === question);
    
    if (existingIndex !== -1) {
        // 更新已存在的错题
        mistakes[existingIndex].attempts += 1;
        mistakes[existingIndex].userAnswer = userAnswer;
        mistakes[existingIndex].timestamp = new Date().toISOString();
    } else {
        // 添加新错题
        mistakes.unshift(mistake); // 新错题放在最前面
    }
    
    // 限制错题数量，保留最近的50条
    if (mistakes.length > 50) {
        mistakes.pop();
    }
    
    // 保存到localStorage
    localStorage.setItem('mathMistakes', JSON.stringify(mistakes));
}

/**
 * 根据难度获取使用的运算符
 * @param {string} difficulty - 难度级别
 * @returns {Array} 包含运算符的数组
 */
function getOperationsFromDifficulty(difficulty) {
    if (difficulty === '简单') {
        return ['+', '-'];
    } else if (difficulty === '中等') {
        return ['+', '-', '×'];
    } else if (difficulty === '困难') {
        return ['+', '-', '×', '÷'];
    }
    return [];
}

/**
 * 更新用户统计数据
 * 在完成练习后更新各项统计指标
 * @param {number} score - 本次练习得分
 * @param {number} correct - 正确题数
 * @param {number} wrong - 错误题数
 * @param {string} difficulty - 难度级别
 * @param {number} totalTime - 总用时（秒）
 * @param {number} avgTime - 平均每题用时（秒）
 * @returns {Object} 更新后的统计数据
 */
function updateUserStats(score, correct, wrong, difficulty, totalTime, avgTime) {
    const stats = getUserStats();
    const today = new Date().toDateString();
    const operations = getOperationsFromDifficulty(difficulty);
    
    // 更新练习统计
    stats.totalPractices += 1;
    stats.totalProblems += (correct + wrong);
    stats.totalCorrect += correct;
    
    // 更新最高成绩
    stats.highestScore = Math.max(stats.highestScore, score);
    
    // 更新困难模式最高分
    if (difficulty === '困难') {
        stats.hardModeHighScore = Math.max(stats.hardModeHighScore, score);
    }
    
    // 更新最快平均时间
    if (avgTime > 0) { // 避免0或负值
        stats.fastestAvgTime = Math.min(stats.fastestAvgTime, avgTime);
    }
    
    // 更新连续天数
    const lastDate = stats.lastPracticeDate ? new Date(stats.lastPracticeDate).toDateString() : null;
    if (lastDate !== today) {
        if (lastDate && new Date(today) - new Date(lastDate) <= 86400000) { // 1天内
            stats.currentStreak += 1;
        } else if (!lastDate) {
            stats.currentStreak = 1;
        } else {
            stats.currentStreak = 1; // 重置连续天数
        }
        stats.lastPracticeDate = new Date().toISOString();
    }
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    
    // 更新使用过的运算符
    operations.forEach(op => {
        if (!stats.usedOperations.includes(op)) {
            stats.usedOperations.push(op);
        }
    });
    
    // 保存更新后的统计数据
    saveUserStats(stats);
    
    return stats;
}

/**
 * 检查成就解锁状态
 * 检查用户是否解锁了新的成就
 * @param {number|null} currentScoreToCheck - 当前得分（可选）
 * @returns {boolean} 是否有新成就解锁
 */
function checkAchievements(currentScoreToCheck = null) {
    const stats = getUserStats();
    const previouslyUnlocked = [...(stats.unlockedAchievements || [])];
    
    // 确保成就数组已初始化
    if (!Array.isArray(stats.unlockedAchievements)) {
        stats.unlockedAchievements = [];
    }
    
    // 成就定义
    const achievements = [
        {
            id: 'first_practice',
            title: '初次体验',
            description: '完成第一次练习',
            check: () => stats.totalPractices >= 1
        },
        {
            id: 'streak_3',
            title: '坚持不懈',
            description: '连续3天进行练习',
            check: () => stats.currentStreak >= 3
        },
        {
            id: 'perfect_score',
            title: '满分学霸',
            description: '获得满分100分',
            check: () => currentScoreToCheck === 100 || stats.highestScore === 100
        },
        {
            id: 'math_master',
            title: '数学大师',
            description: '在困难模式下获得90分以上',
            check: () => stats.hardModeHighScore >= 90
        },
        {
            id: 'operations_all',
            title: '运算全能手',
            description: '使用所有运算符（加减乘除）',
            check: () => {
                const ops = ['+', '-', '×', '÷'];
                return ops.every(op => stats.usedOperations.includes(op));
            }
        },
        {
            id: 'speed_demon',
            title: '速算达人',
            description: '平均每题用时少于3秒',
            check: () => stats.fastestAvgTime < 3
        },
        {
            id: 'practice_10',
            title: '坚持练习',
            description: '完成10次练习',
            check: () => stats.totalPractices >= 10
        },
        {
            id: 'streak_7',
            title: '习惯养成',
            description: '连续7天进行练习',
            check: () => stats.currentStreak >= 7 || stats.maxStreak >= 7
        },
        {
            id: 'mistake_master',
            title: '错题王',
            description: '掌握10道错题',
            check: () => stats.masteredMistakes >= 10
        },
        {
            id: 'accurate_50',
            title: '精准计算',
            description: '正确率达到50%',
            check: () => stats.totalProblems > 0 && (stats.totalCorrect / stats.totalProblems) >= 0.5
        },
        {
            id: 'accurate_80',
            title: '高精度',
            description: '正确率达到80%',
            check: () => stats.totalProblems > 10 && (stats.totalCorrect / stats.totalProblems) >= 0.8
        },
        {
            id: 'problem_100',
            title: '百题斩',
            description: '完成100道题目',
            check: () => stats.totalProblems >= 100
        }
    ];
    
    // 检查每个成就
    achievements.forEach(achievement => {
        if (!stats.unlockedAchievements.includes(achievement.id) && achievement.check()) {
            stats.unlockedAchievements.push(achievement.id);
        }
    });
    
    // 如果有新解锁的成就，保存状态
    if (stats.unlockedAchievements.length > previouslyUnlocked.length) {
        // 找出新解锁的成就
        const newUnlocked = stats.unlockedAchievements.filter(id => !previouslyUnlocked.includes(id));
        stats.newlyUnlocked = newUnlocked;
        saveUserStats(stats);
        return true; // 有新成就解锁
    }
    
    return false; // 没有新成就解锁
}

/**
 * 获取历史记录
 * 从localStorage中读取用户的练习历史记录
 * @returns {Array} 历史记录数组
 */
function getHistory() {
    const history = localStorage.getItem('mathHistory');
    return history ? JSON.parse(history) : [];
}

/**
 * 添加历史记录
 * 将本次练习记录添加到历史记录中
 * @param {Object} record - 包含练习详情的记录对象
 */
function addHistory(record) {
    const history = getHistory();
    history.unshift(record); // 将新记录添加到开头
    
    // 限制历史记录数量，保留最近的20条
    if (history.length > 20) {
        history.pop();
    }
    
    localStorage.setItem('mathHistory', JSON.stringify(history));
} 