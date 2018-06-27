// BUDGET CONTROLLER
var budgetController = (function() {
    
    // Create a function constructor 
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description; 
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round(((this.value / totalIncome) * 100));  
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;  
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description; 
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(current) {
            sum += current.value; 
        });
        
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        
        totals: {
            exp: 0,
            inc: 0
        }, 
        
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // If there is only one item in the inc array, then:
            // inc.length = 1 (which is at the 0th index). 
            // ID becomes 1  
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else {
                newItem = new Income(ID, des, val);
            }
            
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            // Map returns a brand new array
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);
            
            // Delete element 
            if (index !== -1) {
                
                // Removes 1 element from an index 
                data.allItems[type].splice(index, 1);    
            }
            
        },
        
        calculateBudget: function() {
            // Calculate total income and expenses 
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // Calculate percentage of income that was spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });

            return allPerc;
        },
        
        testing: function() {
            console.log(data);
        }
    }
    
})();


// UI CONTROLLER 
var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetlabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        incomePercentageLabel: '.budget__income--percentage',
        expensesPercentageLabel: '.budget__expenses--percentage',
        container: '.container',
        individualExpensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
            var numSplit, wholeNum, dec, sign;
            
            // + or - before number  
            // Exactly 2 decimal points
            // Comma separating the thousands 
            // 2310.123 -> + 2,310.12 
            // 2000 -> + 2,000.00
            
            num = Math.abs(num);
            num = num.toFixed(2); // Round to 2 decimal places and add leading decimals
            
            numSplit = num.split('.') // split decimals and whole numbers
            
            wholeNum = numSplit[0];
            dec = numSplit[1];
            
            // Adding comma only when whole number is more than 3 chars
            if (wholeNum.length > 3) {
                
                // input 12345, wholeNum.subStr(0, wholeNum.length - 3) = 12
                wholeNum = wholeNum.substr(0, wholeNum.length - 3) + ',' + wholeNum.substr(wholeNum.length - 3, 3); 
            }
            
            type === 'exp' ? sign = "-" : sign = "+";
            
            return sign + ' ' + wholeNum + "." + dec;
        }
    
        // This function loops through each element in the list and 
        // calls a function to do something with it
        var nodeListForEach = function(list, callBackFunction) {
            for (var i = 0; i < list.length; i++) {
                callBackFunction(list[i], i); // param - current, index
            }
        };
    
    return {
        getInput: function() {
          return {
            // Either 'inc' or 'exp'
            type: document.querySelector(DOMstrings.inputType).value, 
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
          };
        },
        
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            
            // Create HTML string with placeHolder text 
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // Replace the placeHolder text with some actual data 
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID) {
            var elementSelection = document.getElementById(selectorID)
            
            elementSelection.parentNode.removeChild(elementSelection);
        },
        
        clearFieldsclearFields: function() {
            var fields, fieldsArray;
            
            // query Selector All returns a list
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            // convert list to array 
            fieldsArray = Array.prototype.slice.call(fields);
            
            // Empty array by looping over it and clearing it
            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });
            
            // Sets focus back to the description 
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            
            obj.budget > 0 ? type = 'inc' : type = 'exp'; 
            
            document.querySelector(DOMstrings.budgetlabel).textContent = formatNumber(obj.budget, type)
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, type);
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, type);
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.expensesPercentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.expensesPercentageLabel).textContent = '-';
            }
        },
        
        displayPercentages: function(percentageArray) {
            // Grabs all the percentages from the html, then place them all in a list
            var fields = document.querySelectorAll(DOMstrings.individualExpensesPercentageLabel);
            
            // Calls the function to display each percentage in the array as a string
            nodeListForEach(fields, function(current, index) {
                if (percentageArray[index] > 0) {
                    current.textContent = percentageArray[index] + '%';
                } else {
                    current.textContent = '-';
                }
            });
        },
        
        displayMonth: function() {
            var currentDate, currentYear, currentMonth, months;
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            
            currentDate = new Date();
            
            currentYear = currentDate.getFullYear();
            currentMonth = months[currentDate.getMonth()];
            
            document.querySelector(DOMstrings.dateLabel).textContent = currentMonth + ' ' + currentYear;
        },
        
        changeType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            
            // Adding CSS 
            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        
        getDOMStrings: function() {
            return DOMstrings;
        }
    };
    
})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // Listener for ANYWHERE in the document - a user presses the 'return' key
        // Return key is keycode 13
        document.addEventListener('keypress', function(event) {
          if (event.keyCode === 13 || event.which === 13 ) {
              ctrlAddItem();
          }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        // Change from income to expenses, vice versa
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)
    };
    
    var updatePercentages = function() {
        // 1. Calculate percentages 
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    var updateBudget = function() {
        // 1. Calculate budget 
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget 
        var budget = budgetCtrl.getBudget();
        
        // 3. Display budget on UI
        UICtrl.displayBudget(budget);
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get input data 
        input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller 
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add new item to the UI 
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFieldsclearFields();

            // Call updateBudget
            updateBudget();
            
            // Calculate and update percentages 
            updatePercentages();
            
        }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        // itemID = inc-0
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            // Example: inc-0
            // split() converts into an array of [inc, 0]
            splitID = itemID.split('-');
            
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete the item from the data structure 
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show new budget
            updateBudget();
            
            // 4. Calculate and update percentages 
            updatePercentages();
        }
    };
    
   return {
       init: function() {
           UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
           });
           UICtrl.displayMonth();
           setupEventListeners();
       }
   };
    
    
})(budgetController, UIController);


controller.init();
