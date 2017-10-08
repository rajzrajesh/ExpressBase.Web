﻿var tabNum = 0;
var DataSource = function (refid, name, is_new, ver_num, type, fd_id, dsobj, cur_status) {
    this.Obj_Id = refid;
    this.Name = name;
    this.Description;
    this.Code;
    this.ObjectType = type;
    this.Is_New = is_new;
    this.Version_num = ver_num;
    this.CommitBtn;
    this.SaveBtn;
    this.Versions;
    this.ver_Refid = refid;
    this.HistoryVerNum;
    this.changeLog;
    this.commitUname;
    this.commitTs;
    this.ValidInput = true;
    this.Object_String_WithVal;
    this.Filter_Params;
    this.Parameter_Count;
    this.SelectedFdId;
    this.FilterDId = fd_id;
    this.Rel_object;
    this.rel_arr = [];
    this.runver_Refid;
    this.DsObj = dsobj;
    this.curr_status = cur_status;

    var DSPropGrid = new Eb_PropertyGrid("dspropgrid");

    this.Init = function () {
        this.SaveBtn = $('#save');
        this.CommitBtn = $('#commit');

        $('#ver_his').off("click").on("click", this.VerHistory.bind(this));
        $('.closeTab').off("click").on("click", this.deleteTab.bind(this));
        $('#execute' + tabNum).off("click").on("click", this.Execute.bind(this));
        $('#runSqlFn0').off("click").on("click", this.RunSqlFn.bind(this));
        $('#testSqlFn0').off("click").on("click", this.TestSqlFn.bind(this));
        //  $('#fd' + tabNum).off("change").on("change", this.Clear_fd.bind(this));
        // $("#fdlist" + tabNum).off("click").on("click", this.Load_filter_dialog_list.bind(this));
        $(".selectpicker").selectpicker();
        //  $('#fd' + tabNum).off("loaded.bs.select").on("loaded.bs.select", this.SetFdInit(this, this.FilterDId));
        $('#compare').off('click').on('click', this.Compare.bind(this));
        $('#status').off('click').on('click', this.StatusPage.bind(this));
        $('.wrkcpylink').off("click").on("click", this.OpenPrevVer.bind(this));
        if (this.DsObj === null) {
            this.DsObj = new EbObjects["EbDataSource"]("EbDataSource1");
        }
        DSPropGrid.setObject(this.DsObj, AllMetas["EbDataSource"]);
        this.Name = this.DsObj.Name;

    }

    DSPropGrid.PropertyChanged = function (obj, pname) {
        if (pname === "Name")
            this.Name = obj.Name;
        else if (pname === "Description")
            this.Description = obj.Description;
        else if (pname === "FilterDialogRefId") {
            $('#paramdiv #filterBox').remove();
            $('#paramdiv').show();
            $('#codewindow').removeClass("col-md-10");
            $('#codewindow').addClass("col-md-8");

            $.post("../CE/GetFilterBody", { "ObjId": obj.FilterDialogRefId },
                function (result) {
                    $('#paramdiv').append(result);
                    $.LoadingOverlay("hide");
                });
        }
    };

    this.SetValues = function () {
        this.Code = window.editor.getValue();
        this.changeLog = $('#obj_changelog').val();
    }

    this.AddVerNavTab = function (navitem, tabitem) {
        $("#versionNav a[href='#vernav" + tabNum + "']").tab('show');
        $('#versionNav').append(navitem);
        $('#versionTab').append(tabitem);
        $("#versionNav a[href='#vernav" + tabNum + "']").tab('show');
    }

    //this.SetFdInit = function (me, fdId) {
    //    var val = "Select Filter Dialog";
    //    if (this.Is_New === false && fdId !== "") {
    //        val = this.FilterDId;
    //    }
    //    this.Load_filter_dialog_list(val);
    //}

    //this.Clear_fd = function () {
    //    var getNav = $("#versionNav li.active a").attr("href");
    //    $(getNav + ' #inner_well' + tabNum).children().remove();
    //    $('#execute' + tabNum).addClass('collapsed');
    //};

    //this.Load_filter_dialog_list = function (val) {
    //    var getNav = $("#versionNav li.active a").attr("href");
    //    if (!$(getNav + ' #fdlist' + tabNum + ' .bootstrap-select').hasClass('open')) {
    //        $(getNav + ' #fdlist' + tabNum + ' #fd' + tabNum).children().remove();
    //        $(getNav + ' #fdlist' + tabNum + ' .selectpicker').selectpicker('refresh');
    //        $('#loader_fd' + tabNum).show();
    //        $.ajax({
    //            url: "../CE/GetObjects_refid_dict",
    //            type: 'post',
    //            data: { obj_type: 12 },
    //            success: function (data) {
    //                $(getNav + ' #fdlist' + tabNum + ' #fd' + tabNum).children().remove();
    //                $(getNav + ' #fdlist' + tabNum + ' #fd' + tabNum).append("<option value='Select Filter Dialog' data-tokens='Select Filter Dialog'>Select Filter Dialog</option>");
    //                $.each(data, function (i, obj) {
    //                    $(getNav + ' #fd' + tabNum).append("<option value='" + obj.refId + "' data-tokens='" + obj.refId + "'>" + obj.name + "</option>")
    //                });
    //                $(getNav + ' #fdlist' + tabNum + ' .selectpicker').selectpicker('refresh');
    //                $(getNav + ' #fdlist' + tabNum + ' .selectpicker').selectpicker('val', val);
    //                $('#loader_fd' + tabNum).hide();
    //            }
    //        });

    //    }
    //}

    this.deleteTab = function (e) {
        var tabContentId = $(e.target).parent().attr("href");
        $(e.target).parent().parent().remove(); //remove li of tab
        $(tabContentId).remove();
        $('#versionNav a:last').tab('show'); // Select first tab        
    };

    this.VerHistory = function () {
        $.LoadingOverlay("show");
        $.post("../CE/GetVersions",
            {
                objid: this.Obj_Id
            }, this.Version_List.bind(this));
    }

    this.Version_List = function (result) {
        $.LoadingOverlay("hide");
        this.SetValues();
        this.Versions = result;
        tabNum++;
        var navitem = "<li><a data-toggle='tab' href='#vernav" + tabNum + "'>History<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + tabNum + "' class='tab-pane fade'>" +
            "<table class='table table-striped table-bordered col-md-12' id='versions" + tabNum + "'>" +
            "<thead class='verthead" + tabNum + "'>" +
            "<tr>" +
            "<th class='col-md-1'>Version Number</th>" +
            "<th class='col-md-4'>Change Log</th>" +
            "<th class='col-md-1'>Committed By</th>" +
            "<th class='col-md-2'>Committed At</th>" +
            "<th class='col-md-1'> </th>" +
            "</tr>" +
            " </thead>" +
            "<tbody id='vertbody" + tabNum + "' class='vertbody'></tbody>" +
            "</table>" +
            "</div>";
        this.AddVerNavTab(navitem, tabitem);
        var scrollPos = $('#versionTab').offset().top;
        $(window).scrollTop(scrollPos);

        this.ShowVersions();

    }

    this.ShowVersions = function () {
        $.each(this.Versions, this.ShowVersions_inner.bind(this));
    }

    this.ShowVersions_inner = function (i, obj) {
        $('#vertbody' + tabNum).append("<tr>" +
            "<td>" + obj.versionNumber + "</td> " +
            "<td>" + obj.changeLog + "</td> " +
            "<td>" + obj.commitUname + "</td> " +
            "<td>" + obj.commitTs + "</td> " +
            "<td><input type='button' id='view_code" + tabNum + i + "' class='view_code' value='View' data-id=" + obj.refId + " data-verNum=" + obj.versionNumber + " data-changeLog=" + obj.changeLog + " data-commitUname=" + obj.commitUname + " data-commitTs=" + obj.commitTs + "></td>" +
            " </tr>");
        $('#view_code' + tabNum + i).off("click").on("click", this.OpenPrevVer.bind(this));
    };

    this.OpenPrevVer = function (e) {
        $.LoadingOverlay("show");
        tabNum++;
        this.ver_Refid = $(e.target).attr("data-id");
        this.HistoryVerNum = $(e.target).attr("data-verNum");
        //this.changeLog = $(e.target).attr("data-changeLog");
        // this.commitUname = $(e.target).attr("data-commitUname");
        //this.commitTs = $(e.target).attr("data-commitTs");
        $.post('../CE/VersionCodes', { objid: this.ver_Refid, objtype: this.ObjectType })
            .done(this.VersionCode_success.bind(this));
    }

    this.VersionCode_drpListItem = function (i, version) {
        var vnum = version.versionNumber;
        $('#vernav' + tabNum + " select").append("<option value='" + version.id + "' data-tokens='" + vnum + "'> v " + version.versionNumber + "</option>");
    };

    this.VersionCode_success = function (data) {
        var navitem = "<li><a data-toggle='tab' href='#vernav" + tabNum + "' data-verNum='" + this.HistoryVerNum + "'>v." + this.HistoryVerNum + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + tabNum + "' class='tab-pane fade' data-id=" + this.ver_Refid + ">";
        this.AddVerNavTab(navitem, tabitem);
        $('#vernav' + tabNum).append(
            " <div>" +
            "<textarea id='vercode" + tabNum + "' name='vercode' class='code'>" + data + "</textarea>" +
            "</div>");
        window.editor1 = CodeMirror.fromTextArea(document.getElementById("vercode" + tabNum), {
            mode: "text/x-sql",
            lineNumbers: true,
            lineWrapping: true,
            autoRefresh: true,
            readOnly: true,
            foldGutter: { rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment) },
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });

        var getNav = $("#versionNav li.active a").attr("href");
        $(".selectpicker").selectpicker();
        $.LoadingOverlay("hide");
        setTimeout(function () {
            window.editor1.refresh();
        }, 500);
        $('.selectpicker').selectpicker({
            size: 4
        });

        $('.selectpicker').selectpicker('refresh');
        this.Init();
    };

    this.Execute = function () {
        if (!$('#execute' + tabNum).hasClass('collapsed')) {
            //dasdsd
        }
        else {
            this.Find_parameters(false, false, false);
            $.LoadingOverlay("show");
            if (this.Parameter_Count !== 0 && $('#fd' + tabNum + ' option:selected').text() === "Select Filter Dialog") {
                alert("Please select a filter dialog");
                $.LoadingOverlay("hide");
            }
            else if (this.Parameter_Count === 0) {
                $.LoadingOverlay("hide");
                var getNav = $("#versionNav li.active a").attr("href");
            }
            else {
                this.SetValues();
                this.Find_parameters(false, false, false);
                // this.Save(false);
                this.SelectedFdId = $('#fd' + tabNum + ' option:selected').val();
                this.Load_Fd();
            }
        }
    }

    this.RunSqlFn = function () {
        $.LoadingOverlay("show");
        this.SetValues();
        if ($('.fd option:selected').text() === "Select Filter Dialog") {
            alert("Please select a filter dialog");
            $.LoadingOverlay("hide");
        }
        this.Save(true);
    }

    this.TestSqlFn = function () {
        $.LoadingOverlay("show");
        alert("Test");
    }

    this.StatusPage = function () {
        tabNum++;
        var getNav = $("#versionNav li.active a").attr("href");
        var navitem = "<li><a data-toggle='tab' href='#vernav" + tabNum + "'> status <button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + tabNum + "' class='tab-pane fade'>";
        this.AddVerNavTab(navitem, tabitem);
        $('#vernav' + tabNum).append("<div class=' well col-md-12'>" +
            "<div class='col-md-2 col-md-offset-1'>Status<select class='selectpicker btn' id='status_drpdwn" + tabNum + "'></select></div>" +
            "<div class='col-md-6' style='display:inline'><textarea id='StatChlog" + tabNum + "' class='StatChlog' style='width:100%'></textarea></div>" +
            "<div class='col-md-2' style='display:inline'><button class='btn' id='confirm_stat_change" + tabNum + "'>confirm</button></div>" +
            "</div>" +
            "<div class='col-md-12'><div class='status-cont'><div id='statwindow" + tabNum + "' class='statwindow'></div></div></div>");

        if (this.curr_status === "Development") {
            $('#status_drpdwn' + tabNum).append("<option value='Test'>Test</option>");
        }
        if (this.curr_status === "Test") {
            $('#status_drpdwn' + tabNum).append("<option value='Development'>Development</option>" +
                "<option value='UAT' id='uat'>UAT</option>" +
                "<option value='Live'>Live</option>");
        }
        if (this.curr_status === "UAT") {
            $('#status_drpdwn' + tabNum).append("<option value='Live'>Live</option>");
        }
        if (this.curr_status === "Live") {
            $('#status_drpdwn' + tabNum).append("<option value='Development'>Development</option>" +
                "<option value='Test'>Test</option>" +
                "<option value='Offline'>Offline</option>");
        }
        if (this.curr_status === "Offline") {
            $('#status_drpdwn' + tabNum).append("<option value='Development'>Development</option>" +
                "<option value='Test'>Test</option>" +
                "<option value='Obsolete'>Obsolete</option>");
        }
        if (this.curr_status === "Obsolete") {
            //do something
        }
        $('.selectpicker').selectpicker({
            size: 4
        });
        $('.selectpicker').selectpicker('refresh');

        $('#confirm_stat_change' + tabNum).off("click").on("click", this.ChangeStatus.bind(this));

        $.post("../CE/GetStatusHistory", { _refid: this.ver_Refid }, function (data) {
            var firstentry_flag = true;
            $.each(data, function (i, obj) {
                if (firstentry_flag === true) {
                    $('#statwindow' + tabNum).append("<div class='st_box2'></div>");
                    firstentry_flag = false;
                }
                else {
                    $('#statwindow' + tabNum).append("<div class='st_box1'></div>");
                    $('#statwindow' + tabNum).append("<div class='st_box2'></div>");
                }
            });
        });
    }

    this.ChangeStatus = function () {
        var _chlog = $('#StatChlog' + tabNum).val();
        var _stat = $('#status_drpdwn' + tabNum + ' option:selected').val();

        $.post('../CE/ChangeStatus', { _refid: this.ver_Refid, _changelog: _chlog, _status: _stat }, function () { alert("Changed Successfully");});
    }

    this.Load_version_list = function () {
        $("#versionNav a[href='#vernav" + tabNum + "']").tab('show');
        $('#loader_fd' + tabNum).show();
        $.post('../CE/GetVersions', { objid: this.Obj_Id },
            function (data) {
                $('#selected_Ver_1' + tabNum).append("<option value='Current' data-tokens='Select Version'>Current</option>");
                $('#selected_Ver_2' + tabNum).append("<option value='Select Version' data-tokens='Select Version'>Select version</option>");
                $.each(data, function (i, obj) {
                    $('#selected_Ver_1' + tabNum).append("<option value='" + obj.refId + "' data-tokens='" + obj.versionNumber + "'> v " + obj.versionNumber + "</option>");
                    $('#selected_Ver_2' + tabNum).append("<option value='" + obj.refId + "' data-tokens='" + obj.versionNumber + "'> v " + obj.versionNumber + "</option>");
                });
                $('.selectpicker').selectpicker({
                    size: 4
                });
                $('.selectpicker').selectpicker('refresh');
                $('#loader_fd' + tabNum).hide();
            })
    };

    this.Compare = function () {
        tabNum++;
        var navitem = "<li><a data-toggle='tab' href='#vernav" + tabNum + "'> compare <button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + tabNum + "' class='tab-pane fade'>";
        this.AddVerNavTab(navitem, tabitem);
        $('#vernav' + tabNum).append("<div>" +
            "<div class='well'>" +
            " <div>" +
            " <div class='col-md-4 col-md-offset-3'>" +
            "<div class='verlist input-group col-md-6' style='display:inline-block'>" +
            "<select id='selected_Ver_1" + tabNum + "' class='selectpicker' name='selected_Ver_1' class='form-control selected_Ver selectpicker show-tick' data-live-search='true'>" +
            "</select>" +
            "</div>" +
            "<div class='verlist input-group col-md-6' style='display:inline-block'>" +
            "<select id='selected_Ver_2" + tabNum + "' class='selectpicker' name='selected_Ver_2' class='form-control selected_Ver selectpicker show-tick' data-live-search='true'>" +
            "</select>" +
            "</div>" +
            "<i class='fa fa-circle-o-notch fa-spin fa-1x fa-fw' id='loader_fd" + tabNum + "' style='display:none;color:dodgerblue;'></i>" +
            "</div>" +
            " </div>" +
            "<button id='compare_inner" + tabNum + "' class='compare_inner btn btn-primary'>Comapre</button>" +
            "</div>" +
            "<div id='compare_result" + tabNum + "'></div>" +
            " </div>");
        $('#compare_inner' + tabNum).off("click").on("click", this.Differ.bind(this));
        this.Load_version_list();
        $('.selectpicker').selectpicker({
            size: 4
        });

    };

    this.Differ = function () {
        var verRefid1 = $('#selected_Ver_1' + tabNum + ' option:selected').val();
        var verRefid2 = $('#selected_Ver_2' + tabNum + ' option:selected').val();
        if (verRefid2 === "Select Version") {
            alert("Please Select A Version");
            $.LoadingOverlay("hide");
        }
        else if (verRefid1 === "Current") {
            var _code = $('#code_edit0 .code').text();
            $.LoadingOverlay("show");
            var v1 = this.Version_num;
            var v2 = $('#selected_Ver_2' + tabNum + ' option:selected').attr("data-tokens");
            this.getSecondVersionCode(verRefid2, v1, v2, _code);

        }
        else {
            $.LoadingOverlay("show");
            var data_1;
            v1 = $('#selected_Ver_1' + tabNum + ' option:selected').attr("data-tokens");
            v2 = $('#selected_Ver_2' + tabNum + ' option:selected').attr("data-tokens");
            $.post('../CE/VersionCodes', { "objid": verRefid1, "objtype": this.ObjectType }, this.getSecondVersionCode.bind(this, verRefid2, v1, v2));
        }
        //  }
    }

    this.getSecondVersionCode = function (verRefid2, selected_ver_number_1, selected_ver_number_2, result) {
        $.post('../CE/VersionCodes', { "objid": verRefid2, "objtype": this.ObjectType }).done(this.CallDiffer.bind(this, result, selected_ver_number_1, selected_ver_number_2));
    }

    this.Init();

    this.Save = function (needRun) {
        $.LoadingOverlay("show");
        this.SetValues();
        if (this.ObjectType === 5) {
            this.SetSqlFnName();
        }
        this.Find_parameters(true, true, needRun);
    };

    this.Commit = function (needRun) {
        $.LoadingOverlay("show");
        this.SetValues();
        if (this.ObjectType === 5) {
            this.SetSqlFnName();
        }
        this.Find_parameters(true, false, needRun);
    }

    $(this.SaveBtn).off("click").on("click", this.Save.bind(this, false));
    $(this.CommitBtn).off("click").on("click", this.Commit.bind(this, false));

    this.Find_parameters = function (isCommitorSave, issave, needRun) {
        this.SetValues();
        var result = this.Code.match(/\@\w+/g);
        var filterparams = [];
        if (result !== null) {
            for (var i = 0; i < result.length; i++) {
                result[i] = result[i].substr(1);
                if (result[i] === "search" || result[i] === "and_search" || result[i] === "search_and" || result[i] === "where_search" || result[i] === "limit" || result[i] === "offset" || result[i] === "orderby") {
                    //
                }
                else {
                    if ($.inArray(result[i], filterparams) === -1)
                        filterparams.push(result[i]);
                }
            }
            filterparams.sort();
            this.Filter_Params = filterparams;
            this.Parameter_Count = filterparams.length;
        }
        else {
            this.Parameter_Count = 0;
        }
        if (isCommitorSave === true) {
            var _json = null;
            if (this.Parameter_Count !== 0 && ($('#fd' + tabNum + ' option:selected').text() === "Select Filter Dialog")) {
                if (confirm('Are you sure you want to save this without selecting a filter dialog?')) {
                    this.SetValues();
                    this.FilterDId = null;
                    this.GetUsedSqlFns(needRun, issave);
                }
                else {
                    $.LoadingOverlay("hide");
                }
            }
            else {
                this.SetValues();
                this.GetUsedSqlFns(needRun, issave);
            }
        }
    }

    this.CreateObjString = function () {
        // this.ValidInput = true;
        if (this.Parameter_Count !== 0) {
            var ObjString = "[";
            var filter_control_list = "datefrom,dateto";
            var myarray = filter_control_list.split(',');
            for (var i = 0; i < myarray.length; i++) {
                console.log($("#" + myarray[i]).val());
                var type = $('#' + myarray[i]).attr('data-ebtype');
                var name = $('#' + myarray[i]).attr('name');
                var value = $('#' + myarray[i]).val();
                if (type === '6')
                    value = value.substring(0, 10);

                ObjString += '{\"name\":\"' + name + '\",';
                ObjString += '\"type\":\"' + type + '\",';
                ObjString += '\"value\":\"' + value + '\"},';
            }
            ObjString = ObjString.slice(0, -1) + ']';
            this.Object_String_WithVal = ObjString;
        }
        else {
            this.Object_String_WithVal = null;
        }
        console.log("Object_String_WithVal" + this.Object_String_WithVal);
    }

    this.DrawTable = function () {
        $.LoadingOverlay("show");
        tabNum++;
        var navitem = "<li><a data-toggle='tab' href='#vernav" + tabNum + "'>Result-" + this.Name + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + tabNum + "' class='tab-pane fade'>";
        this.AddVerNavTab(navitem, tabitem);
        $('#vernav' + tabNum).append(" <div class=' filter_modal_body'>" +
            "<table class='table table-striped table-bordered' id='sample" + tabNum + "'></table>" +
            "</div>");
        $.post('GetColumns4Trial', {
            ds_refid: this.runver_Refid,
            parameter: this.Object_String_WithVal
        }, this.Load_Table_Columns.bind(this));
    };

    this.Load_Table_Columns = function (result) {
        if (result === "") {
            alert('Error in Query');
        }
        else {
            var cols = JSON.parse(result);
            $("#sample" + tabNum).dataTable({
                columns: cols,
                serverSide: true,
                lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
                scrollX: "100%",
                scrollY: "300px",
                processing: true,
                ajax: {
                    url: "http://localhost:8000/ds/data/" + this.Obj_Id,
                    type: "POST",
                    data: this.Load_tble_Data.bind(this),
                    crossDomain: true,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", "Bearer " + getToken());
                    },
                    dataSrc: function (dd) { return dd.data; },
                }
            });

            $("#versionNav a[href='#vernav" + tabNum + "']").tab('show');
            $.LoadingOverlay("hide");
        }
    };

    this.Load_tble_Data = function (dq) {
        delete dq.columns; delete dq.order; delete dq.search;
        dq.RefId = this.Obj_Id;
        dq.TFilters = [];
        dq.Params = this.Object_String_WithVal;
        return dq;
    };

    this.Load_Fd = function () {
        var getNav = $("#versionNav li.active a").attr("href");
        if ($(getNav + ' #inner_well' + tabNum).children().length === 0) {
            $.post("../CE/GetFilterBody", { "ObjId": this.SelectedFdId },
                function (result) {
                    $(getNav + ' #inner_well' + tabNum).append(result);

                }, $.LoadingOverlay("hide"));
        }
        else {
            $.LoadingOverlay("hide");
        }
    };

    this.RunDs = function () {
        $.LoadingOverlay("show");
        if (this.Parameter_Count === 0) {
            this.Save(false);
            //  this.ValidInput = true;
            this.Object_String_WithVal = "";
            // this.DrawTable();
        }
        else {
            this.Find_parameters(true, true, true);
        }
    };


    $("#run").off("click").on("click", this.RunDs.bind(this));

    this.CallDiffer = function (data_1, selected_ver_number, curr_ver, data_2) {
        var getNav = $("#versionNav li.active a").attr("href");
        this.SetValues();
        if (selected_ver_number > curr_ver) {
            $.post("../CE/GetDiffer", {
                NewText: data_1, OldText: data_2
            })
                .done(this.showDiff.bind(this, selected_ver_number, curr_ver));
        }
        else {
            $.post("../CE/GetDiffer", {
                NewText: data_2, OldText: data_1
            })
                .done(this.showDiff.bind(this, curr_ver, selected_ver_number));
        }
    };

    this.showDiff = function (new_ver_num, old_ver_num, data) {
        var getNav = $("#versionNav li.active a").attr("href");

        $('#versionNav li.active a').text().replace('compare', "v." + old_ver_num + " v/s v." + new_ver_num);

        $('#compare_result' + tabNum).empty();
        $('#compare_result' + tabNum).append("<div id='oldtext" + tabNum + "'class='leftPane'>" +
            "</div>" +
            "  <div id='newtext" + tabNum + "' class='rightPane'>" +
            "</div>");
        $('#oldtext' + tabNum).html("<div class='diffHeader'>v." + old_ver_num + "</div>" + data[0]);
        $('#newtext' + tabNum).html("<div class='diffHeader'>v." + new_ver_num + "</div>" + data[1]);
        $('.leftPane').scroll(function () {
            $('.rightPane').scrollTop($(this).scrollTop());
            $('.rightPane').scrollLeft($(this).scrollLeft());
        });
        $('.rightPane').scroll(function () {
            $('.leftPane').scrollTop($(this).scrollTop());
            $('.leftPane').scrollLeft($(this).scrollLeft());
        });
        var scrollPos = $('#compare_result' + tabNum).offset().top;
        $(window).scrollTop(scrollPos);
        $.LoadingOverlay("hide");
    };

    this.SetSqlFnName = function () {
        var result = this.Code.match(/create\s*FUNCTION\s*|create\s*or\s*replace\s*function\s*(.[\s\S]*?\))/i);
        if (result.length > 0) {
            var fnName = result[1].replace(/\s\s+/g, ' ');
            var x = fnName.replace('(', "_v" + this.Version_num + '(');
            var v = this.Code.replace(result[1], x);
            $('#obj_name').val(x);
            $('#code').val(v);
            editor.setValue(v);
        }
    };

    this.GetUsedSqlFns = function (needRun, issave) {

        this.rel_arr = [];
        this.Rel_object = null;
        $.post("../CE/GetObjects_refid_dict", { obj_type: 5 }, this.FetchUsedSqlFns.bind(this, issave, needRun));
    };

    this.FetchUsedSqlFns = function (issave, needRun, data) {
        $.each(data, this.FetchUsedSqlFns_inner.bind(this));

        var getNav = $("#versionNav li.active a").attr("href");
        var filter_dialog_refid = $(getNav + ' #fdlist' + tabNum + ' #fd' + tabNum + ' option:selected').val();

        if (filter_dialog_refid === "Select Filter Dialog") {
            filter_dialog_refid = null;
        }
        this.SetValues();
        this.rel_arr.push(filter_dialog_refid);
        this.Rel_object = this.rel_arr.toString();
        this.DsObj.Sql = btoa(this.Code);
        //_json = { $type: "ExpressBase.Objects.EbDataSource, ExpressBase.Objects", filterdialogrefid: filter_dialog_refid, sql: btoa(unescape(encodeURIComponent(this.Code))), name: this.Name }
        if (issave === true) {
            $.post("../CE/SaveEbDataSource",
                {
                    "Id": this.Obj_Id,
                    "Name": this.Name,
                    "Description": this.Description,
                    "ObjectType": this.ObjectType,
                    "Token": getToken(),
                    "isSave": "true",
                    "VersionNumber": this.Version_num,
                    "filterDialogId": filter_dialog_refid,
                    "json": JSON.stringify(_json),
                    "NeedRun": needRun,
                    "rel_obj": this.Rel_object
                }, this.CallDrawTable.bind(this, needRun));
        }
        else {

            $.post("../CE/CommitEbDataSource", {
                "id": this.Obj_Id,
                "changeLog": this.changeLog,
                "json": JSON.stringify(this.DsObj),
                "rel_obj": this.Rel_object
            }, this.CallDrawTable.bind(this, needRun));
        }

    };
    this.CallDrawTable = function (needRun, result) {
        if (needRun === true) {
            var getNav = $("#versionNav li.active a").attr("href");
            this.runver_Refid = $(getNav).attr("data-id");
            if (this.runver_Refid === "new") {
                this.runver_Refid = result.refId;
                alert(this.runver_Refid);
            }
            this.CreateObjString();
            this.DrawTable();
        }
        alert("Success");
        $("#close_popup").click();
        $.LoadingOverlay("hide");
    };

    this.FetchUsedSqlFns_inner = function (i, sqlFn) {
        if (this.Code.indexOf(sqlFn.name) !== -1) {
            this.rel_arr.push(i);
        }
    };
}