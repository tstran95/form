// Hàm validation
function Validation(option){

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRule = {};
    // Thực hiện validate
    function validate(inputElement , rule) {
        var errMessage;
        var errElement = getParent(inputElement , option.formGroupSelector).querySelector(option.errSelector);

        //  Lấy ra các rules của selector
        var rules = selectorRule[rule.selector];

        //  Lọc qua từng rule và kiểm tra
        for(var i = 0; i < rules.length; i++) {
            // chạy vòng lặp lấy từ phần tử 
            errMessage = rules[i](inputElement.value);
            // Nếu có lỗi thì dừng việc kiểm tra
            if(errMessage) break;
        }

        if(errMessage) {
            getParent(inputElement , option.formGroupSelector).classList.add('invalid');
            errElement.innerText = errMessage;
        }else {
            errElement.innerText = "";
            getParent(inputElement , option.formGroupSelector).classList.remove('invalid');
        }
        return !errMessage;
    }

    // Lấy Element của Form
    var formElement = document.querySelector(option.form);
    if(formElement){

        //  Bỏ hành động mặc định khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            // Loc qua từng rule và validate
            option.rules.forEach((rule)=>{
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(!isValid) {
                    isFormValid = false;
                }
            })
            // Nếu không có lỗi
            if(isFormValid){
                // Trường hợp submit với javascript
                if(typeof option.onSubmit === 'function'){
                    // formElement = document.getElemetById('form-1')
                    var enableInputs = formElement.querySelectorAll('[name]:not([disable])');
                    
                    var formValue = Array.from(enableInputs).reduce((values, input)=>{
                        values[input.name] = input.value;
                        return values;
                    },{});


                    option.onSubmit(formValue);
                }
                // Trường hợp submit với hành vi mặc đinhk
                else {
                    formElement.submit();
                }
            }
        }

        //  Lặp qua mỗi rule và xử lí (lắng ngghe sự kiện để có trong form)
        option.rules.forEach((rule) => {

            // Lưu Rule cho mỗi input
            if(!Array.isArray(selectorRule[rule.selector])) {
                selectorRule[rule.selector] = [rule.test];
            }else {
                selectorRule[rule.selector].push(rule.test);
            }

            var inputElement = formElement.querySelector(rule.selector);

            if(inputElement){
                inputElement.onblur = function(){
                    validate(inputElement, rule);
                }
            }
        });
    }
}
// Định nghĩa các rule
// Nguyên tắc của rule
//1. Khi có lỗi thì trả ra mess lỗi
//2. Khi hợp lệ: không trả ra gì cả
Validation.isRequired = function(selector , message) {
    return {
        selector : selector,
        test : function (input) {
            return input.trim() ? undefined : message || "Vui lòng nhập trường này!";
        }
    }
}
Validation.isEmail = function(selector , message) {
    return {
        selector : selector,
        test : function (input) {
            var regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
            return regex.test(input) ? undefined : message || 'Mời nhập lại email!';
        }
    }    
}
Validation.minLength = function(selector , minLength , message) {
    return {
        selector : selector,
        test : function (input) {
            return input.length >= minLength ? undefined : message || 'Mật khẩu phải có nhiều hơn 6 kí tự'
        }
    }      
}
Validation.isConfirmed = function (selector  , getConfirmValue , message) {
    return {
        selector : selector,
        test : function (input) {
            return input === getConfirmValue() ? undefined : message || 'Nội dung nhập chưa chính xác';
        }
    }       
}