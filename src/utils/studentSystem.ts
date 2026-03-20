
import { Student, Gender, ActiveCollege, CollegeType, AdmissionPolicy } from '../types';
import { generateName } from '../data/gameData';
import { generateId } from './gameUtils';

export const getStudentTags = (s: Pick<Student, 'gaokaoScore' | 'talent' | 'effort' | 'wealth'>) => { 
    const tags: string[] = []; 
    if (s.gaokaoScore <= 450) tags.push('差等生'); 
    else if (s.gaokaoScore <= 550) tags.push('普通生'); 
    else if (s.gaokaoScore <= 600) tags.push('良好生'); 
    else if (s.gaokaoScore <= 650) tags.push('优等生'); 
    else tags.push('天才生'); 

    if (s.talent <= 30) tags.push('迟钝'); 
    else if (s.talent <= 60) tags.push('常人'); 
    else if (s.talent <= 80) tags.push('聪明'); 
    else if (s.talent <= 95) tags.push('人才'); 
    else tags.push('天才'); 

    if (s.effort <= 30) tags.push('懒惰'); 
    else if (s.effort <= 70) tags.push('碌碌'); 
    else tags.push('勤奋'); 

    if (s.wealth <= 30) tags.push('贫穷'); 
    else if (s.wealth <= 60) tags.push('小康'); 
    else if (s.wealth <= 90) tags.push('优渥'); 
    else tags.push('富豪'); 
    
    return tags; 
};

// Internal single student generator
const generateSingleStudent = (targetCollege: CollegeType, minScore: number): Student => {
    const gender = Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE;
    const name = generateName();

    // Score generation heavily influenced by minScore
    // We aim for a distribution where most students are above minScore, but some might barely pass
    const baseScore = minScore;
    const bonus = Math.floor(Math.random() * (750 - baseScore));
    // Apply a bell curve-ish bias towards lower bonus (closer to cutoff)
    const bias = Math.pow(Math.random(), 2); 
    let gaokaoScore = baseScore + Math.floor(bonus * (1 - bias));
    
    // Clamp
    gaokaoScore = Math.min(750, Math.max(0, gaokaoScore));

    const wealth = Math.floor(Math.random() * 101);
    
    // Talent correlates loosely with score
    const scoreRatio = gaokaoScore / 750;
    const minTalent = Math.floor(scoreRatio * 40);
    const talent = Math.min(100, minTalent + Math.floor(Math.random() * 60));
    
    // Effort helps score
    const effort = Math.floor(Math.random() * 100);

    const tempStudent = { gaokaoScore, talent, effort, wealth };
    const tags = getStudentTags(tempStudent);

    return {
        id: generateId(),
        name,
        gender,
        ...tempStudent,
        tags,
        satisfaction: 80, // Initial satisfaction
        college: targetCollege
    };
};

export const generateDailyStudents = (policy: AdmissionPolicy, colleges: ActiveCollege[], currentIncomingCount: number, happinessModifier: number = 1): Student[] => {
    // Determine how many students to generate today.
    // The recruiting phase is ~20 days (July 15 - Aug 5).
    // Daily quota approx total / 20, modified by happiness.
    const totalTarget = policy.totalTarget;
    if (totalTarget <= 0 || colleges.length === 0) return [];

    const baseDailyQuota = Math.ceil(totalTarget / 20);
    const dailyQuota = Math.max(1, Math.round(baseDailyQuota * happinessModifier));
    const remainingNeeded = totalTarget - currentIncomingCount;

    // Don't overfill too much
    const countToGen = Math.min(dailyQuota, remainingNeeded);
    if (countToGen <= 0) return [];

    const newStudents: Student[] = [];
    
    // We need to respect college ratios.
    // Calculate how many students each college *should* have roughly.
    // This is a simple stochastic approach: weighted random choice for each new student.
    
    for (let i = 0; i < countToGen; i++) {
        // Create a weighted pool based on policy targets
        const pool: CollegeType[] = [];
        colleges.forEach(c => {
            const target = policy.collegeTargets[c.type] || 0;
            // You could optimize this by tracking how many are already generated per college,
            // but for a daily batch, weighted random is usually fine and ensures variety.
            // To make it robust: weight = target.
            // Note: If a college has 0 target, it won't be in the pool.
            if (target > 0) {
                 pool.push(c.type);
            }
        });

        if (pool.length === 0) break;

        // Weighted random selection
        // Since we pushed types only once above, that's not weighted. Let's fix.
        // Better: Roll a random number 0 -> TotalTarget. Find which bin it falls in.
        
        let randomPoint = Math.random() * totalTarget;
        let selectedCollegeType: CollegeType = pool[0]; // Default
        
        let cumulative = 0;
        for (const type in policy.collegeTargets) {
            cumulative += policy.collegeTargets[type];
            if (randomPoint <= cumulative) {
                selectedCollegeType = type as CollegeType;
                break;
            }
        }

        // 满意度影响生源质量：高满意度提升分数下限
        const scoreBonus = Math.floor((happinessModifier - 1) * 30); // -9 to +9
        const adjustedMinScore = Math.max(300, Math.min(700, policy.minScore + scoreBonus));
        newStudents.push(generateSingleStudent(selectedCollegeType, adjustedMinScore));
    }

    return newStudents;
};
