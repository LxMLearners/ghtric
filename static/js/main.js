
(function($) {

    
    

    var form = $("#gtrich-gen");
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
            finish: 'Generate Dataset',
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

    $('input[name=num_cols]').on("keyup",function() {
        t_cols = $('input[name=num_cols]').val();
        s_cols = Math.floor($('input[name=num_cols]').val() / 2);
        n_cols = t_cols - s_cols;
        $('input[name=num_symbolic_cols]').val(s_cols);
        $('input[name=num_numeric_cols]').val(n_cols);
        writeNumCostCols();
        writeSymbCostCols();
    });

    $('input[name=num_symbolic_cols]').on("keyup",function() {
        t_cols = $('input[name=num_cols]').val();
        s_cols = $('input[name=num_symbolic_cols]').val();
        n_cols = t_cols - s_cols;
        $('input[name=num_numeric_cols]').val(n_cols);
        writeNumCostCols();
        writeSymbCostCols();
    });

    $('input[name=num_numeric_cols]').on("keyup",function() {
        t_cols = $('input[name=num_cols]').val();
        n_cols = $('input[name=num_numeric_cols]').val();
        s_cols = t_cols - s_cols;
        $('input[name=num_symbolic_cols]').val(n_cols);
        writeNumCostCols();
        writeSymbCostCols();
    });

    $('input[name=num_targets]').on("keyup",function() {
        targets = $('input[name=num_targets]').val();
        var def = (1/targets)*100;
        $(".f-imb").remove();
        for (let index = 0; index < targets; index++) {
            $("#targets").append(
                ` <div class="form-group f-imb">
                        <label for="imbalance-${index}" class="form-label">Elements of Class ${index} (%)</label>
                        <input type="number" name="imbalance-${index}" id="imbalance-${index}" value="${def}"/>
                </div>`
            )
        }
    });



    let patterns = {};
    pattern_def_sym = {
           'type': 'symbolic',
           'p_rows' : 'constant',
           'p_cols' : 'constant',
           'p_conts' : 'constant',
           'time_prf' : ''
    };
       pattern_def_num = {
           'type': 'numeric',
           'p_rows' : 'constant',
           'p_cols' : 'constant',
           'p_conts' : 'constant',
           'time_prf' : ''
       };


        $('input[name=dataset_type]').on("change",function() {
    
                if (this.value == 'symbolic') {
                    $('.symb_row').removeClass('d-none');
                    $('.num_row').addClass('d-none');
                    $('.het-cols').addClass('d-none');
                    $('#tric_type_pat').empty();
                    $('#tric_type_pat').append(`<option value="symbolic">Symbolic</option>`);
                    patterns[0] = pattern_def_sym;
                    delete patterns[1];
                    printPatterns(this.value);
                    $(".heterogen").addClass("d-none");
                    $(".no-heterogen").removeClass("d-none");
                }
                else if (this.value == 'numeric') {
                    $('.num_row').removeClass('d-none');
                    $('.symb_row').addClass('d-none');
                    $('.het-cols').addClass('d-none');
                    $('#tric_type_pat').empty();
                    $('#tric_type_pat').append(`<option value="numeric">Numeric</option>`);
                    patterns[0] = pattern_def_num;
                    delete patterns[1];
                    printPatterns(this.value);
                    $(".heterogen").addClass("d-none");
                    $(".no-heterogen").removeClass("d-none");
                } else {
                    $('.symb_row').removeClass('d-none');
                    $('.num_row').removeClass('d-none');
                    $('.het-cols').removeClass('d-none');
                    $('#tric_type_pat').empty();
                    $('#tric_type_pat').append(`<option value="symbolic">Symbolic</option>`);
                    $('#tric_type_pat').append(`<option value="numeric">Numeric</option>`);
                    patterns[0] = pattern_def_sym;
                    patterns[1] = pattern_def_num;
                    printPatterns(this.value);
                    $(".heterogen").removeClass("d-none");
                    $(".no-heterogen").addClass("d-none");
                }
        });

        $('select[name=default_symbs]').on("change",function() {
                $("#num_symbs_form").toggleClass('d-none');
                $("#list_symbs_form").toggleClass('d-none');
        });

        $('select[name=symbolic_background]').on("change",function() {
            if (this.value == 'normal') {
                $(".sym-normal").removeClass('d-none');
            } else{
                $(".sym-normal").addClass('d-none');
            }
            if (this.value == 'discrete') {
                $(".sym-discrete").removeClass('d-none');
            } else{
                $(".sym-discrete").addClass('d-none');
                $("#probs-symb").val("");
            }
        });

        $('select[name=numeric_background]').on("change",function() {
            if (this.value == 'normal') {
                $(".num-normal").removeClass('d-none');
            } else{
                $(".num-normal").addClass('d-none');
            }
            if (this.value == 'discrete') {
                $(".num-discrete").removeClass('d-none');
            } else{
                $(".num-discrete").addClass('d-none');
                $("#probs-symb").val("");
            }
        });

        

        $('.disc-symbs').on("change",function() {

            result_str = "";
            if ($('select[name=symbolic_background]').find(":selected").val() == 'discrete'){
                if ($('select[name=default_symbs]').find(":selected").val() == "default") {
                    num_s = parseInt($('#num_symbs').val())+1;
                    for (let s_i = 1; s_i < num_s; s_i++) {
                        result_str += s_i + " - 0.0\n";
                    }
                } else {
                    symbs = $('#list_symb').val().split(",")
                    for (let s_i = 0; s_i < symbs.length; s_i++) {
                        result_str += symbs[s_i] + " - 0.0\n";
                    }
                } 
                $('#probs-symb').val(result_str);
            }
        });

        $('.disc-num').on("change",function() {

            result_str = "";
            if ($('select[name=numeric_background]').find(":selected").val() == 'discrete'){
                if ($('select[name=real_valued]').find(":selected").val() == "integer") {
                    min_v = parseInt($('#min-int').val());
                    max_v = parseInt($('#max-int').val())+1;
                    for (let s_i = min_v; s_i < max_v; s_i++) {
                        result_str += s_i + " - 0.0\n";
                    }
                } else {
                    result_str += "Input Error. Real valued data cannot be used simultaneously with discrete background.";
                    $('#probs-num').prop( "disabled", true );
                } 
                $('#probs-num').val(result_str);
            }
        });

        $('select[name=tric_rows_dist]').on("change",function() {
            $(".dist-rows").toggleClass('d-none');
         });

         $('select[name=tric_cols_dist]').on("change",function() {
            $(".dist-cols").toggleClass('d-none');
         });

         $('select[name=htric_scols_dist]').on("change",function() {
            $(".hdist-scols").toggleClass('d-none');
         });

         $('select[name=htric_ncols_dist]').on("change",function() {
            $(".hdist-ncols").toggleClass('d-none');
         });

         $('select[name=tric_conts_dist]').on("change",function() {
            $(".dist-conts").toggleClass('d-none');
         });

         $('select[name=cont_pattern]').on("change",function() {
            if ($(this).val() == "order preserving") {
                $("#time_prf_form").removeClass('d-none');
            } else {
                $("#time_prf_form").addClass('d-none');
            }
         });

         $('select[name=plaid_coherency]').on("change",function() {
            if ($(this).val() == "no_overlapping") {
                $(".ov").prop('disabled', true);
            } else {
                $(".ov").prop('disabled', false);
            }
         });



         function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.substring(1);
          }


          $('#addSym').on("click", function(){
            $(".symb-form").removeClass("d-none");
            $(".num-form").addClass("d-none");
         });

          $('#addNum').on("click", function(){
             $(".symb-form").addClass("d-none");
             $(".num-form").removeClass("d-none");
          });

          
        let alphabets = [];
        let sym_alphs = [];
        let num_alphs = [];

             
          function printSetting() {
            $("table.alphabets tbody").empty();
            var i = 0
            for (const a_id in alphabets){
                alph = alphabets[a_id];
                paramsS = "";
                if(alph.background == "normal"){
                    paramsS += `(${alph.param1}, ${alph.param2})`;
                } else if(alph.background == "discrete"){
                    paramsS += `(${alph.param3})`;
                }
                paramsAl = "";
                if(alph.alphabet == "default") {
                        paramsAl += `(${alph.num_symbs})`;
                    } else {
                        paramsAl += `(${alph.list_symbs})`
                } 
                if(alph.type == "numeric"){
                    $("table.alphabets tbody").append(
                        `<tr>
                            <td> (N) ${alph.nrcols} </td>
                            <td> ${capitalize(alph.datatype)}, (min: ${alph.min}; max: ${alph.max}) </td>
                            <td> ${capitalize(alph.background)} ${paramsS}</td>
                            <td>
                                <span id="setting-${i}" class="material-symbols-outlined removeSetting">delete</span>
                            </td>
                        </tr>
                        `)
                } else {
                    $("table.alphabets tbody").append(
                        `<tr>
                            <td> (S) ${alph.nrcols} </td>
                            <td> ${capitalize(alph.alphabet)} ${paramsAl} </td>
                            <td> ${capitalize(alph.background)} ${paramsS}</td>
                            <td>
                                <span id="setting-${i}" class="material-symbols-outlined removeSetting">delete</span>
                            </td>
                        </tr>
                        `)
                }
                i += 1;
            }
            
            writeNumCostCols();
            writeSymbCostCols();
          }

          function writeNumCostCols(){
            if($("#num_numeric_cols").val() - custom_cols("numeric") >= 0){
                $("#ncost_ncols").text($("#num_numeric_cols").val() - custom_cols("numeric"));
            } else{
                $("#ncost_ncols").text("Error: Check nr cols")
            }
        }

        function writeSymbCostCols(){
            if($("#num_symbolic_cols").val() - custom_cols("symbolic") >= 0){
                $("#ncost_scols").text($("#num_symbolic_cols").val() - custom_cols("symbolic"));
            } else{
                $("#ncost_scols").text("Error: Check nr cols")
            }
        }

        

          function custom_cols(type){
                var n_ccols = 0;
                for (const a_id in alphabets){
                    alph = alphabets[a_id];
                    if(alph.type == type)
                        n_ccols += parseInt(alph.nrcols);
                    
                    }
                return n_ccols;
            }

          $('#subNum').on("click", function(){
                setting = {}
                setting['type'] = "numeric";
                setting['nrcols'] = $("#set_nrcols").val();
                setting['min'] = $("#set_min-int").val();
                setting['max'] = $("#set_max-int").val();
                setting['datatype'] = $("#set_real_valued").val();
                setting['background'] = $("#set_numeric_background").val();
                setting['param1'] = $("#set_bkg_param1_num").val();
                setting['param2'] = $("#set_bkg_param2_num").val();
                setting['param3'] = parse_str_probs($("#set_probs-num").val());
                alphabets.push(setting);
                num_alphs.push(setting);
                printSetting();
                $(".num-form").addClass("d-none");
          });

          $('#subSym').on("click", function(){
            setting = {}
            setting['type'] = "symbolic";
            setting['nrcols'] = $("#set_snrcols").val();
            setting['alphabet'] = $("#set_default_symbs").val();
            if (setting['alphabet'] == "default"){
                setting['num_symbs'] = $("#set_num_symbs").val();
                setting['list_symbs'] = "";
            } else {
                setting['num_symbs'] = "";
                setting['list_symbs'] = $("#set_list_symb").val();
            }
            setting['background'] = $("#set_symbolic_background").val();
            setting['param1'] = $("#set_bkg_param1_symb").val();
            setting['param2'] = $("#set_bkg_param2_symb").val();
            setting['param3'] = parse_str_probs($("#set_probs-symb").val());
            alphabets.push(setting);
            sym_alphs.push(setting);
            printSetting();
            $(".symb-form").addClass("d-none");
      });

      $("table.alphabets tbody").on("click", ".removeSetting" , function(){
        var position =  $(this).attr('id').split("-")[1];
        if(alphabets[position]['type'] == "numeric"){
            let indexToRemove = num_alphs.indexOf(alphabets[position]);
            num_alphs.splice(indexToRemove, 1);
        } else {
            let indexToRemove = sym_alphs.indexOf(alphabets[position]);
            sym_alphs.splice(indexToRemove, 1);
        }
        alphabets.splice(position, 1);
        printSetting();
      });


      $('select[name=set_default_symbs]').on("change",function() {
        $("#set_num_symbs_form").toggleClass('d-none');
        $("#set_list_symbs_form").toggleClass('d-none');
    });

      $('select[name=set_symbolic_background]').on("change",function() {
        if (this.value == 'normal') {
            $(".set-sym-normal").removeClass('d-none');
        } else{
            $(".set-sym-normal").addClass('d-none');
        }
        if (this.value == 'discrete') {
            $(".set-sym-discrete").removeClass('d-none');
        } else{
            $(".set-sym-discrete").addClass('d-none');
            $("#set_probs-symb").val("");
        }
    });

    $('select[name=set_numeric_background]').on("change",function() {
        if (this.value == 'normal') {
            $(".set-num-normal").removeClass('d-none');
        } else{
            $(".set-num-normal").addClass('d-none');
        }
        if (this.value == 'discrete') {
            $(".set-num-discrete").removeClass('d-none');
        } else{
            $(".set-num-discrete").addClass('d-none');
            $("#set_probs-symb").val("");
        }
    });

    $('.set_disc-symbs').on("change",function() {

        result_str = "";
        if ($('select[name=set_symbolic_background]').find(":selected").val() == 'discrete'){
            if ($('select[name=set_default_symbs]').find(":selected").val() == "default") {
                num_s = parseInt($('#set_num_symbs').val())+1;
                for (let s_i = 1; s_i < num_s; s_i++) {
                    result_str += s_i + " - 0.0\n";
                }
            } else {
                symbs = $('#set_list_symb').val().split(",")
                for (let s_i = 0; s_i < symbs.length; s_i++) {
                    result_str += symbs[s_i] + " - 0.0\n";
                }
            } 
            $('#set_probs-symb').val(result_str);
        }
    });

    $('.set_disc-num').on("change",function() {

        result_str = "";
        if ($('select[name=set_numeric_background]').find(":selected").val() == 'discrete'){
            if ($('select[name=set_real_valued]').find(":selected").val() == "integer") {
                min_v = parseInt($('#set_min-int').val());
                max_v = parseInt($('#set_max-int').val())+1;
                for (let s_i = min_v; s_i < max_v; s_i++) {
                    result_str += s_i + " - 0.0\n";
                }
            } else {
                result_str += "Input Error. Real valued data cannot be used simultaneously with discrete background.";
                $('#set_probs-num').prop( "disabled", true );
            } 
            $('#set_probs-num').val(result_str);
        }
    });



         valid_patterns = [
             'symbolic-constant-constant-constant',
             'symbolic-none-constant-constant',
             'symbolic-constant-none-constant',
             'symbolic-constant-constant-none',
             'symbolic-constant-none-none',
             'symbolic-none-constant-none',
             'symbolic-none-none-constant',
             'symbolic-order preserving-none-none',
             'symbolic-none-order preserving-none',
             'symbolic-none-none-order preserving',
             'numeric-constant-constant-constant',
             'numeric-none-constant-constant',
             'numeric-constant-none-constant',
             'numeric-constant-constant-none',
             'numeric-constant-none-none',
             'numeric-none-constant-none',
             'numeric-none-none-constant',
             'numeric-additive-additive-additive',
             'numeric-additive-constant-constant',
             'numeric-constant-additive-constant',
             'numeric-constant-constant-additive',
             'numeric-constant-additive-additive',
             'numeric-additive-constant-additive',
             'numeric-additive-additive-constant',
             'numeric-multiplicative-multiplicative-multiplicative',
             'numeric-multiplicative-constant-constant',
             'numeric-constant-multiplicative-constant',
             'numeric-constant-constant-multiplicative',
             'numeric-constant-multiplicative-multiplicative',
             'numeric-multiplicative-constant-multiplicative',
             'numeric-multiplicative-multiplicative-constant',
             'numeric-order preserving-none-none',
             'numeric-none-order preserving-none',
             'numeric-none-none-order preserving'
         ]




        function printPatterns(dtype){
            $("#patterns-selected").empty();
            $("#patterns-selected").append(`<div class="form-flex patt-row">
            <span style="flex: 0.5;"></span>
            <span style="flex: 2; font-weight:bold;">Component</span>
            <span style="flex: 2; font-weight:bold;">Row Pattern</span>
            <span style="flex: 2; font-weight:bold;">Column Pattern</span>
            <span style="flex: 2; font-weight:bold;">Context Pattern</span>
            <span style="flex: 0.5;"></span>
            <span style="flex: 2; font-weight:bold;">Time Profile</span>
        </div>`);
            valid_patterns.forEach(pat => {
                p = pat.split("-");
                if((dtype == "symbolic" && p[0] == "symbolic") || (dtype == "numeric" && p[0] == "numeric") || (dtype == "heterogeneous")){
                    checked = "";
                    if(pat == "symbolic-constant-constant-constant" || pat == "numeric-constant-constant-constant")
                        checked = "checked";
                    time_prf = "";
                    if (p[3] == "order preserving"){
                        time_prf = `<span style="flex: 2;">
                                        <select class="t-pattern" name="time_prf" id="time_prf_${p[0]}" >
                                            <option value="random">Random</option>
                                            <option value="monotonically_increasing">Monotonically Increasing</option>
                                            <option value="monotonically_decreasing">Monotonically Decreasing</option>
                                        </select>
                                    </span>`
                    } else{
                        time_prf = `<span style="flex: 2;"></span>`;
                    }
                    $("#patterns-selected").append(
                        '<div class="form-flex patt-row">'
                        + `<span style="flex: 0.5;"><input type="checkbox" name="patterns" id="${pat}" style="text-align:center; vertical-align:middle; height: 20px; margin-left: 10px;" ${checked}></span>`
                        + `<span style="flex: 2;">${capitalize(p[0])}</span>`
                        + `<span style="flex: 2;">${capitalize(p[1])}</span>`
                        + `<span style="flex: 2;">${capitalize(p[2])}</span>`
                        + `<span style="flex: 2;">${capitalize(p[3])}</span>`
                        + `<span style="flex: 0.5;"><a class="info" id="I_${pat}" style="margin-right: 10px ;">&#9432;</a></span>` + time_prf
                    + '</div>');
                    
                };
            });
        }

        function collectPatterns(){
            var patterns = []
            $("input[type=checkbox]").each(function () {
                var self = $(this);
                if (self.is(':checked')) {
                    pat = self.attr("id");
                    p = pat.split("-");
                    t_prf = "";
                    if(p[3] == "order preserving")
                        t_prf = $('#time_prf_'+p[0]).find(":selected").val();
                    patterns.push({
                        'type': p[0],
                        'p_rows': p[1],
                        'p_cols': p[2],
                        'p_conts': p[3],
                        'time_prf': t_prf
                    });
                }
            }); 
            return patterns;
        }

        $("#patterns-selected").on("click", ".info" , function(){

            // Get the modal
            var modal = document.getElementById("myModal");
            
            // Get the button that opens the modal
            var el = $(this);
            var id = el.attr("id"); 
            pat = id.split("_");
            pat = pat[1].split("-");
            row_p = pat[1];
            col_p = pat[2];
            cont_p = pat[3];
            img_name = `static/images/${row_p.charAt(0)}_${col_p.charAt(0)}_${cont_p.charAt(0)}.png`;

            $("#patt-image").attr("src", img_name);
            
            // Get the <span> element that closes the modal
            var span = document.getElementsByClassName("close")[0];
            
            modal.style.display = "block";
            
            // When the user clicks on <span> (x), close the modal
            span.onclick = function() {
            modal.style.display = "none";
            }
            
            // When the user clicks anywhere outside of the modal, close it
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
        })


        $("#to-add").on("click", "#dowload", function(){
            console.log(sessionStorage.getItem("dir_name"));
            window.open(`/download_file?dir_name=${sessionStorage.getItem("dir_name")}`, '_blank');
            $('#download-area').children().last().remove();
        });

        $('input[name=rand_seed]').on("change",function() {
            if (this.value == 'yes') {
                $("#form-seed").removeClass("d-none");
            } else {
                $("#form-seed").addClass("d-none");
            }

        });

        function parse_str_probs (inputString) {
            if(inputString == "") return "";

            let floatArray = inputString.match(/(\S+\s*-\s*\d+\.\d+)/g);
    
            if (floatArray) {
              floatArray = floatArray.map(function(item) {
                return parseFloat(item.split('-')[1].trim());
              });
            }
            return floatArray; 
      
        }

        function resumeAlphabets(colect_nums, colect_symbs){
            col_n = [...colect_nums];
            col_s = [...colect_symbs];
            var dataset_type = $("input[name=dataset_type]:checked").val();
                if (dataset_type != "symbolic"){
                    setting = {}
                    setting['type'] = "numeric";
                    if (dataset_type == "heterogeneous")
                        setting['nrcols'] = $("#num_numeric_cols").val() - custom_cols("numeric");
                    else
                        setting['nrcols'] = $("#num_cols").val() ;
                    setting['min'] = $("#min-int").val();
                    setting['max'] = $("#max-int").val();
                    setting['datatype'] = $("#real_valued").val();
                    setting['background'] = $("#numeric_background").val();
                    setting['param1'] = $("#bkg_param1_num").val();
                    setting['param2'] = $("#bkg_param2_num").val();
                    setting['param3'] = $("#probs-num").val().includes("Error") ? "" : parse_str_probs($("#probs-num").val());
                    col_n.push(setting);
                }
                if (dataset_type != "numeric"){
                    setting = {}
                    setting['type'] = "symbolic";
                    if (dataset_type == "heterogeneous")
                        setting['nrcols'] = $("#num_symbolic_cols").val() - custom_cols("symbolic");
                    else
                        setting['nrcols'] = $("#num_cols").val() ;
                    setting['alphabet'] = $("#default_symbs").val();
                    setting['num_symbs'] = $("#num_symbs").val();
                    setting['list_symbs'] = $("#list_symb").val();
                    setting['background'] = $("#symbolic_background").val();
                    setting['param1'] = $("#bkg_param1_symb").val();
                    setting['param2'] = $("#bkg_param2_symb").val();
                    setting['param3'] = $("#probs-symb").val().includes("Error") ? "" : parse_str_probs($("#probs-symb").val());
                    col_s.push(setting);
                }
                return [col_n, col_s];
        }

        function submit(){
            $('#download-area').empty();
            $("#wait").removeClass("d-none");
            request = {};

            imbalance = [];
            $(".f-imb input").each(function(index, element) {
                imbalance.push($(element).val()/100);
            });
            request["imbalance"] = imbalance;

            $("input:not([type='radio']), select").each(function(index,data) {
                request[$(this).attr("name")] = $(this).val();
            });

            $('input[type="radio"]').each(function() {
                var var_name = $(this).attr('name');
                if ($(this).prop('checked')) {
                    request[var_name] = $(this).val();
                }
            });

            if (request["list_symb"].length > 0) {
                request["alphabet"] = request["list_symb"].split(",");
            } else {
                request["alphabet"] = [];
            }

            request["patterns"] = collectPatterns();
            num_alph_res = resumeAlphabets(num_alphs, sym_alphs)[0];
            sym_alph_res = resumeAlphabets(num_alphs, sym_alphs)[1];
            // request["alphabets"] = resumeAlphabets(request["alphabets"]);
            request["alphabets"] = num_alph_res.concat(sym_alph_res);

            console.log(request);
            $.ajax({
                url: "/generate", // Replace with your API endpoint URL
                type: "POST",
                dataType: "text",
                contentType: "application/json",
                data: JSON.stringify(request),
                success: function(response) {
                    var form = $("#signup-form");
                    $('#download-area').empty();
                    $('#download-area').append(`
                                    <div class="form-row">
                                        <div class="form-flex">
                                            <div class="form-date-group">
                                                <button type="button" id="dowload">Dowload Dataset</button>
                                            </div>
                                        </div>
                                    </div>
                    `);
                    $("#wait").addClass("d-none");
                    r = JSON.parse(response);
                    sessionStorage.setItem("dir_name", r["dir_name"]);
                    

                },
                error: function(xhr, status, error) {
                    console.log(xhr);
                    console.log(status);
                  console.error("Error:", error);
                  $('#download-area').empty();
                  $('#download-area').append(`
                                    <div class="form-row">
                                        <div class="form-flex">
                                            <div class="form-date-group">
                                                <p> An error occured. Check parameters and try again. </p>
                                            </div>
                                        </div>
                                    </div>
                    `);
                }
              });
              request = {};
        }

        $(".ov").prop('disabled', true);
        // patterns[0] = pattern_def_sym;
        printPatterns($('input[name=dataset_type]').val());
        
        
        writeNumCostCols();
        writeSymbCostCols();
        

})(jQuery);