let currentCourseData = [];
let historicalCourseData = [];
let historicalFiles = new Set();
let prerequisiteRules = {
    "微積分(下)": {
        prerequisites: ["微積分(上)"],
        type: "mustTaken"
    },
    "普通物理實驗": {
        prerequisites: ["普通物理"],
        type: "cannotTakeBefore"
    },
    "普通化學實驗": {
        prerequisites: ["普通化學"],
        type: "cannotTakeBefore"
    },
    "有機化學": {
        prerequisites: ["普通化學"],
        type: "mustTaken"
    },
    "電路學": {
        prerequisites: ["醫工物理"],
        type: "mustTaken"
    },
    "工程數學(一)": {
        prerequisites: ["微積分(下)"],
        type: "mustTaken"
    },
    "工程數學(二)": {
        prerequisites: ["微積分(下)"],
        type: "mustTaken"
    },
    "電子實驗(一)": {
        prerequisites: ["電路學"],
        type: "cannotTakeBefore"
    },
    "電子實驗(二)": {
        prerequisites: ["電子學(一)", "電子實驗(一)"],
        type: "multipleConditions",
        conditions: {
            cannotTakeBefore: ["電子學(一)"],
            mustTaken: ["電子實驗(一)"]
        }
    },
    "生物化學": {
        prerequisites: ["普通化學"],
        type: "mustTaken"
    },
    "解剖生理學(一)": {
        prerequisites: ["普通生物學"],
        type: "mustTaken"
    },
    "解剖生理學(二)": {
        prerequisites: ["解剖生理學(一)"],
        type: "mustTaken"
    },
    "解剖生理學實驗(一)": {
        prerequisites: ["解剖生理學(一)"],
        type: "cannotTakeBefore"
    },
    "解剖生理學實驗(二)": {
        prerequisites: ["解剖生理學(二)"],
        type: "cannotTakeBefore"
    },
    "生物材料": {
        prerequisites: ["有機化學"],
        type: "mustTaken"
    },
    "生物輸送原理": {
        prerequisites: ["普通物理", "微積分(上)"],
        type: "multipleConditions",
        conditions: {
            mustTaken: ["普通物理", "微積分(上)"]
        }
    },
    "生醫訊號處理": {
        prerequisites: ["訊號與系統"],
        type: "mustTaken"
    },
    "生醫感測模組整合應用": {
        prerequisites: ["程式語言"],
        type: "mustTaken"
    }
};
// 顯示擋修規則
function displayRules() {
    const rulesList = document.getElementById('rulesList');
    rulesList.innerHTML = '';
    
    Object.entries(prerequisiteRules).forEach(([course, rule]) => {
        const ruleDiv = document.createElement('div');
        ruleDiv.className = 'rule-item';
        
        let ruleTypeText = '';
        let ruleTypeClass = '';
        let prerequisitesText = '';
        
        switch(rule.type) {
            case 'mustTaken':
                ruleTypeText = '必須曾修';
                ruleTypeClass = 'must-taken';
                prerequisitesText = `必須曾修：${rule.prerequisites.join('、')}`;
                break;
            case 'cannotTakeBefore':
                ruleTypeText = '不得先修';
                ruleTypeClass = 'cannot-take-before';
                prerequisitesText = `不得先修於 ${rule.prerequisites.join('、')} `;
                break;
            case 'multipleConditions':
                ruleTypeText = '多重條件';
                ruleTypeClass = 'multiple';
                let conditions = [];
                if (rule.conditions.mustTaken) {
                    conditions.push(`必須曾修：${rule.conditions.mustTaken.join('、')}`);
                }
                if (rule.conditions.cannotTakeBefore) {
                    conditions.push(`不得先修於 ${rule.conditions.cannotTakeBefore.join('、')} `);
                }
                prerequisitesText = conditions.join('<br>');
                break;
        }
        
        ruleDiv.innerHTML = `
            <h3>${course} <span class="rule-type ${ruleTypeClass}">${ruleTypeText}</span></h3>
            <p>${prerequisitesText}</p>
        `;
        
        rulesList.appendChild(ruleDiv);
    });
}
// 初始化模態框功能
function initializeModal() {
    const modal = document.getElementById('rulesModal');
    const btn = document.getElementById('showRulesBtn');
    const span = document.getElementsByClassName('close-modal')[0];
    
    btn.onclick = function() {
        displayRules();
        modal.style.display = "block";
    }
    
    span.onclick = function() {
        modal.style.display = "none";
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

// 初始化規則管理功能
function initializeRuleManagement() {
    const manageModal = document.getElementById('manageRulesModal');
    const manageBtn = document.getElementById('manageRulesBtn');
    const closeManageModal = manageModal.querySelector('.close-modal');
    const ruleTypeSelect = document.getElementById('ruleType');
    const saveRuleBtn = document.getElementById('saveRule');

    // 顯示管理模態框
    manageBtn.onclick = function() {
        manageModal.style.display = "block";
        loadExistingRules();
    }

    // 關閉管理模態框
    closeManageModal.onclick = function() {
        manageModal.style.display = "none";
    }

    // 規則類型變更處理
    ruleTypeSelect.addEventListener('change', function() {
        toggleMultipleConditions(this.value);
    });

    // 儲存規則
    saveRuleBtn.addEventListener('click', saveRule);

    // 初始化動態輸入欄位
    initializeDynamicInputs();
}

// 初始化模態框和按鈕事件
document.addEventListener('DOMContentLoaded', function() {
    initializeModal();
    initializeRuleManagement();
});

// 切換多重條件顯示
function toggleMultipleConditions(ruleType) {
    const multipleConditions = document.querySelector('.multiple-conditions');
    const prerequisites = document.querySelector('.prerequisites-container');
    
    if (ruleType === 'multipleConditions') {
        multipleConditions.style.display = 'block';
        prerequisites.style.display = 'none';
    } else {
        multipleConditions.style.display = 'none';
        prerequisites.style.display = 'block';
    }
}

// 初始化動態輸入欄位
function initializeDynamicInputs() {
    const lists = ['prerequisitesList', 'mustTakenList', 'cannotTakeBeforeList'];
    
    lists.forEach(listId => {
        const list = document.getElementById(listId);
        const addButton = list.querySelector('.add-prerequisite');
        
        addButton.addEventListener('click', () => addPrerequisiteInput(listId));
    });
}

// 新增先修課程輸入欄位
function addPrerequisiteInput(listId) {
    const list = document.getElementById(listId);
    const newItem = document.createElement('div');
    newItem.className = 'prerequisite-item';
    
    newItem.innerHTML = `
        <input type="text" class="prerequisite-input">
        <button type="button" class="remove-prerequisite">-</button>
    `;
    
    const removeButton = newItem.querySelector('.remove-prerequisite');
    removeButton.addEventListener('click', () => newItem.remove());
    
    list.appendChild(newItem);
}

// 儲存規則
function saveRule() {
    const courseName = document.getElementById('courseName').value;
    const ruleType = document.getElementById('ruleType').value;
    
    if (!courseName) {
        alert('請輸入課程名稱');
        return;
    }

    let rule = {
        type: ruleType
    };

    if (ruleType === 'multipleConditions') {
        rule.conditions = {
            mustTaken: getInputValues('mustTakenList'),
            cannotTakeBefore: getInputValues('cannotTakeBeforeList')
        };
    } else {
        rule.prerequisites = getInputValues('prerequisitesList');
    }

    prerequisiteRules[courseName] = rule;
    
    // 更新顯示
    loadExistingRules();
    resetForm();
    
    // 顯示成功訊息
    alert('規則儲存成功！');
}

// 獲取輸入值
function getInputValues(listId) {
    const inputs = document.querySelectorAll(`#${listId} .prerequisite-input`);
    return Array.from(inputs)
        .map(input => input.value.trim())
        .filter(value => value !== '');
}

// 載入現有規則
function loadExistingRules() {
    const rulesList = document.getElementById('existingRulesList');
    rulesList.innerHTML = '';
    
    Object.entries(prerequisiteRules).forEach(([course, rule]) => {
        const ruleDiv = document.createElement('div');
        ruleDiv.className = 'existing-rule-item';
        
        let prerequisitesText = '';
        if (rule.type === 'multipleConditions') {
            const mustTaken = rule.conditions.mustTaken || [];
            const cannotTakeBefore = rule.conditions.cannotTakeBefore || [];
            prerequisitesText = `
                必須曾修：${mustTaken.join('、')}<br>
                不得先修：${cannotTakeBefore.join('、')}
            `;
        } else {
            prerequisitesText = rule.prerequisites.join('、');
        }
        
        ruleDiv.innerHTML = `
            <div class="rule-info">
                <h4>${course}</h4>
                <p>類型：${getRuleTypeText(rule.type)}</p>
                <p>條件：${prerequisitesText}</p>
            </div>
            <div class="rule-actions">
                <button class="edit-rule" onclick="editRule('${course}')">編輯</button>
                <button class="delete-rule" onclick="deleteRule('${course}')">刪除</button>
            </div>
        `;
        
        rulesList.appendChild(ruleDiv);
    });
}

// 取得規則類型文字
function getRuleTypeText(type) {
    const types = {
        mustTaken: '必須曾修',
        cannotTakeBefore: '不得先修',
        multipleConditions: '多重條件'
    };
    return types[type] || type;
}

// 編輯規則
function editRule(courseName) {
    const rule = prerequisiteRules[courseName];
    if (!rule) return;
    
    document.getElementById('courseName').value = courseName;
    document.getElementById('ruleType').value = rule.type;
    
    toggleMultipleConditions(rule.type);
    
    // 清空所有輸入欄位
    ['prerequisitesList', 'mustTakenList', 'cannotTakeBeforeList'].forEach(listId => {
        const list = document.getElementById(listId);
        list.innerHTML = '';
        addPrerequisiteInput(listId);
    });
    
    // 填入既有值
    if (rule.type === 'multipleConditions') {
        if (rule.conditions.mustTaken) {
            rule.conditions.mustTaken.forEach(prereq => {
                const input = document.querySelector('#mustTakenList .prerequisite-input');
                input.value = prereq;
                addPrerequisiteInput('mustTakenList');
            });
        }
        if (rule.conditions.cannotTakeBefore) {
            rule.conditions.cannotTakeBefore.forEach(prereq => {
                const input = document.querySelector('#cannotTakeBeforeList .prerequisite-input');
                input.value = prereq;
                addPrerequisiteInput('cannotTakeBeforeList');
            });
        }
    } else if (rule.prerequisites) {
        rule.prerequisites.forEach(prereq => {
            const input = document.querySelector('#prerequisitesList .prerequisite-input');
            input.value = prereq;
            addPrerequisiteInput('prerequisitesList');
        });
    }
}

// 刪除規則
function deleteRule(courseName) {
    if (confirm(`確定要刪除 ${courseName} 的擋修規則嗎？`)) {
        delete prerequisiteRules[courseName];
        loadExistingRules();
    }
}

// 重置表單
function resetForm() {
    document.getElementById('courseName').value = '';
    document.getElementById('ruleType').value = 'mustTaken';
    toggleMultipleConditions('mustTaken');
    
    ['prerequisitesList', 'mustTakenList', 'cannotTakeBeforeList'].forEach(listId => {
        const list = document.getElementById(listId);
        list.innerHTML = '';
        addPrerequisiteInput(listId);
    });
}


// 檔案上傳處理 - 修課清單
document.getElementById('currentCourseFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) {
        showNotification('currentCourseNotification', '請選擇檔案', 'error');
        return;
    }
    
    document.getElementById('currentFileName').textContent = file.name;
    processExcelFile(file, false);
});

// 檔案上傳處理 - 歷年修課清單
document.getElementById('historicalCourseFile').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        if (!historicalFiles.has(file.name)) {
            historicalFiles.add(file.name);
            processExcelFile(file, true);
            addFileToList(file.name);
        }
    });
});

// 從文件名抓取課程名稱
function extractCourseName(fileName) {
    const regex = /(\d+) (.+) (.+)\.xlsx?/i;  // 修改正則表達式以匹配 .xls 或 .xlsx
    const match = fileName.match(regex);
    if (match) {
        return match[3];  // 直接返回第三個捕獲組，不需要再切割
    }
    return null;
}

// 將課程名稱作為屬性添加到 Excel 資料中
function addCourseNameToData(data, courseName) {
    // 加入檢查避免 courseName 為 null
    if (!courseName) {
        console.error('無法從檔案名稱提取課程名稱');
        return data;
    }
    return data.map(row => ({ ...row, courseName }));
}
// 檢查先修規則
function checkPrerequisites(currentCourseName, historicalCourses) {
    const rule = prerequisiteRules[currentCourseName];
    if (!rule) return true; // 如果沒有擋修規則，則允許修課

    switch (rule.type) {
        case "mustTaken":
            return rule.prerequisites.every(prereq => 
                historicalCourses.some(course => 
                    course.courseName === prereq && course.停修 !== true
                )
            );

        case "cannotTakeBefore":
            return !rule.prerequisites.some(prereq => 
                !historicalCourses.some(course => 
                    course.courseName === prereq && course.停修 !== true
                )
            );

        case "multipleConditions":
            let isValid = true;
            
            if (rule.conditions.mustTaken) {
                isValid = isValid && rule.conditions.mustTaken.every(prereq =>
                    historicalCourses.some(course => 
                        course.courseName === prereq && course.停修 !== true
                    )
                );
            }

            if (rule.conditions.cannotTakeBefore) {
                isValid = isValid && !rule.conditions.cannotTakeBefore.some(prereq =>
                    !historicalCourses.some(course => 
                        course.courseName === prereq && course.停修 !== true
                    )
                );
            }

            return isValid;

        default:
            return true;
    }
}
// 處理 Excel 檔案
async function processExcelFile(file, isHistorical) {
    const notificationId = isHistorical ? 'historicalCourseNotification' : 'currentCourseNotification';
    
    try {
        const data = await readExcelFile(file);
        const courseName = extractCourseName(file.name);
        const dataWithCourseName = addCourseNameToData(data, courseName);
        
        if (isHistorical) {
            historicalCourseData = [...historicalCourseData, ...dataWithCourseName];
            showNotification(notificationId, `成功載入 ${data.length} 筆歷年資料`, 'success');
        } else {
            currentCourseData = dataWithCourseName;
            showNotification(notificationId, `成功載入 ${data.length} 筆修課資料`, 'success');
        }
    } catch (error) {
        showNotification(notificationId, '檔案處理失敗，請確認檔案格式是否正確', 'error');
        console.error('File processing error:', error);
    }
}

// 讀取 Excel 檔案
function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                let i = 0;
                while (i < rawData.length && !rawData[i].includes('系級')) {
                    i++;
                }
                const headers = rawData[i];
                
                const studentIDIndex = headers.indexOf('學號');
                const nameIndex = headers.indexOf('姓名');
                const classIndex = headers.indexOf('系級');
                const withdrawalIndex = headers.indexOf('停修');
                
                const processedData = rawData.slice(i + 1)
                    .map(row => {
                        if (!row || row.length === 0) return null;
                        return {
                            學號: row[studentIDIndex]?.toString(),
                            姓名: row[nameIndex],
                            系級: row[classIndex],
                            停修: row[withdrawalIndex] === '停修'
                        };
                    })
                    .filter(student => student !== null && student.學號);
                
                resolve(processedData);
                console.log(processedData);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.readAsArrayBuffer(file);
    });
}

// 新增檔案到清單顯示
function addFileToList(fileName) {
    const fileList = document.getElementById('historicalFileList');
    const fileItem = document.createElement('div');
    fileItem.className = 'file-list-item';
    fileItem.innerHTML = `
        <span>${fileName}</span>
        <span class="remove-file" onclick="removeFile('${fileName}')">&times;</span>
    `;
    fileList.appendChild(fileItem);
}

// 移除歷年修課檔案
function removeFile(fileName) {
    historicalFiles.delete(fileName);
    const fileList = document.getElementById('historicalFileList');
    fileList.innerHTML = '';
    historicalFiles.forEach(file => addFileToList(file));
    historicalCourseData = historicalCourseData.filter(
        course => course.courseName !== fileName.slice(0, -4)
    );
    showNotification('historicalCourseNotification', '已移除檔案，請重新檢查擋修狀況', 'error');
}

// 顯示通知
function showNotification(elementId, message, type) {
    const notification = document.getElementById(elementId);
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    // 只有在不是結果通知的情況下才設置自動隱藏
    if (elementId !== 'resultNotification') {
        setTimeout(() => {
            notification.className = 'notification';
        }, 5000);
    }
}
// 檢查擋修狀況
document.getElementById('checkButton').addEventListener('click', function() {
    if (currentCourseData.length === 0) {
        showNotification('resultNotification', '請先上傳修課清單', 'error');
        return;
    }
    
    if (historicalCourseData.length === 0) {
        showNotification('resultNotification', '請先上傳歷年修課清單', 'error');
        return;
    }

    // 檢查每個學生的擋修狀況
    const results = currentCourseData.map(student => {
        const currentCourseName = student.courseName;
        const studentHistoricalCourses = historicalCourseData.filter(
            historical => historical.學號 === student.學號
        );

        return {
            ...student,
            符合擋修: checkPrerequisites(currentCourseName, studentHistoricalCourses)
        };
    });

    displayResults(results);
});

// 顯示結果
function displayResults(results) {
    const resultTable = document.getElementById('resultTable');
    
    // 建立表格
    let html = `
        <table>
            <thead>
                <tr>
                    <th>學號</th>
                    <th>姓名</th>
                    <th>系級</th>
                    <th>課程</th>
                    <th>擋修狀態</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    results.forEach(student => {
        html += `
            <tr class="${student.符合擋修 ? 'valid' : 'invalid'}">
                <td>${student.學號}</td>
                <td>${student.姓名}</td>
                <td>${student.系級}</td>
                <td>${student.courseName}</td>
                <td>${student.符合擋修 ? '符合修課條件' : '不符合修課條件'}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    resultTable.innerHTML = html;
    
    // 顯示總結
    const validCount = results.filter(s => s.符合擋修).length;
    showNotification('resultNotification', 
        `檢查完成：共 ${results.length} 位學生，${validCount} 位符合條件，${results.length - validCount} 位不符合條件`,
        'success'
    );
}