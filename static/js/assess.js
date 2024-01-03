
(function($) {

    
    

    var form = $("#signup-form");
    form.validate({
        errorPlacement: function errorPlacement(error, element) {
            element.before(error);
        },
        rules: {
            email: {
                email: true
            }
        },
        onfocusout: function(element) {
            $(element).valid();
        },
    });

    form.children("div").steps({
        headerTag: "h3",
        bodyTag: "fieldset",
        transitionEffect: "fade",
        stepsOrientation: "vertical",
        titleTemplate: '<div class="title"><span class="step-number">#index#</span><span class="step-text">#title#</span></div>',
        labels: {
            previous: 'Previous',
            next: 'Next',
            finish: 'Submit',
            current: ''
        },
        onStepChanging: function(event, currentIndex, newIndex) {
            if (currentIndex === 0) {
                form.parent().parent().parent().append('<div class="footer footer-' + currentIndex + '"></div>');
            }
            if (currentIndex === 1) {
                form.parent().parent().parent().find('.footer').removeClass('footer-0').addClass('footer-' + currentIndex + '');
            }
            if (currentIndex === 2) {
                form.parent().parent().parent().find('.footer').removeClass('footer-1').addClass('footer-' + currentIndex + '');
            }
            if (currentIndex === 3) {
                form.parent().parent().parent().find('.footer').removeClass('footer-2').addClass('footer-' + currentIndex + '');
            }
            // if(currentIndex === 4) {
            //     form.parent().parent().parent().append('<div class="footer" style="height:752px;"></div>');
            // }
            form.validate().settings.ignore = ":disabled,:hidden";
            return form.valid();
        },
        onFinishing: function(event, currentIndex) {
            form.validate().settings.ignore = ":disabled";
            return form.valid();
        },
        onFinished: function(event, currentIndex) {
            submit();
        },
        onStepChanged: function(event, currentIndex, priorIndex) {

            return true;
        }
    });



    jQuery.extend(jQuery.validator.messages, {
        required: "",
        remote: "",
        email: "",
        url: "",
        date: "",
        dateISO: "",
        number: "",
        digits: "",
        creditcard: "",
        equalTo: ""
    });

    $.dobPicker({
        daySelector: '#birth_date',
        monthSelector: '#birth_month',
        yearSelector: '#birth_year',
        dayDefault: '',
        monthDefault: '',
        yearDefault: '',
        minimumAge: 0,
        maximumAge: 120
    });
    var marginSlider = document.getElementById('slider-margin');
    if (marginSlider != undefined) {
        noUiSlider.create(marginSlider, {
              start: [1100],
              step: 100,
              connect: [true, false],
              tooltips: [true],
              range: {
                  'min': 100,
                  'max': 2000
              },
              pips: {
                    mode: 'values',
                    values: [100, 2000],
                    density: 4
                    },
                format: wNumb({
                    decimals: 0,
                    thousand: '',
                    prefix: '$ ',
                })
        });
        var marginMin = document.getElementById('value-lower'),
	    marginMax = document.getElementById('value-upper');

        marginSlider.noUiSlider.on('update', function ( values, handle ) {
            if ( handle ) {
                marginMax.innerHTML = values[handle];
            } else {
                marginMin.innerHTML = values[handle];
            }
        });
    }


        function readFileInput(inputID){
            var selectedFile = $(`#${inputID}`).prop('files')[0];

            if (selectedFile) {
                var reader = new FileReader(); // Create a FileReader object
                
                reader.onload = function (e) {
                    try {
                        var fileContent = e.target.result;
                        var jsonData = JSON.parse(fileContent);
                        resolve(jsonData);
                    } catch (error) {
                        reject("Error parsing file content as JSON");
                    }
                };
                reader.readAsText(selectedFile);

                // // Define a callback function to handle the file content once it's loaded
                // reader.onload = function(e) {
                //   console.log("Inn");
                //   var fileContent = e.target.result; // Get the file content as a string
                //   var jsonData = JSON.parse(fileContent); // Parse content to JSON
                  
                //   return jsonData;
                // };
            }
        }

        function readFileAndReturnJSON(inputId) {
            return new Promise(function(resolve, reject) {
                var fileInput = document.getElementById(inputId);
        
                if (!fileInput) {
                    reject("Input element not found");
                    return;
                }
        
                var selectedFile = fileInput.files[0];
        
                if (!selectedFile) {
                    reject("No file selected");
                    return;
                }
        
                var reader = new FileReader();
        
                reader.onload = function (e) {
                    try {
                        var fileContent = e.target.result;
                        var jsonData = JSON.parse(fileContent);
                        resolve(jsonData);
                    } catch (error) {
                        reject("Error parsing file content as JSON");
                    }
                };
        
                reader.readAsText(selectedFile);
            });
        }

        async function readAndAssignJsonToVariable(inputId) {
            try {
                var jsonData = await readFileAndReturnJSON(inputId);
                return jsonData;
            } catch (error) {
                console.error("Error:", error);
                return null; // You can handle the error as needed
            }
        }
        

        async function submit(){

            request = {}
            request["Type"] = $('input[name=dataset_type]:checked').val();
            request["Solution"] = await readAndAssignJsonToVariable("tric_solution_file");
            request["GroundTruth"] = await readAndAssignJsonToVariable("ground_truth_file");

            $.ajax({
                url: "http://127.0.0.1:8080/evaluate", // Replace with your API endpoint URL
                type: "POST",
                dataType: "text",
                contentType: "application/json",
                data: JSON.stringify(request),
                success: function(response) {
                    console.log(response);
                },
                error: function(xhr, status, error) {
                    console.log(xhr);
                    console.log(status);
                  console.error("Error:", error);
                }
              });
        }
        

})(jQuery);