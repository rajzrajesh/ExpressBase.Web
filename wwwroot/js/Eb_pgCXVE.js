﻿var Eb_pgCXVE = function (pgObj) {
    this.PGobj = pgObj;
    this.CE_PGObj = {};
    this.pgCXE_Cont_Slctr = "#" + this.PGobj.wraperId + " .pgCXEditor-Cont";
    this.CEctrlsContId = this.PGobj.wraperId + "_CEctrlsCont";
    this.OnCXE_OK = function (obj) { };

    this.CXE_OKclicked = function () {
        this.PGobj.OnInputchangedFn.bind(this.PGobj)();
        this.OnCXE_OK(this.PGobj.PropsObj[this.CurProp]);
    };

    this.pgCXE_BtnClicked = function (e) {
        $("#" + this.PGobj.wraperId + " .pgCollEditor-bg").show();
        $(this.pgCXE_Cont_Slctr + " .modal-footer .modal-footer-body").empty();
        this.CurProp = e.target.getAttribute("for");
        this.CurEditor = this.PGobj.Metas[this.PGobj.propNames.indexOf(this.CurProp.toLowerCase())].editor;
        var editor = e.target.getAttribute("editor");
        if (editor === "7") {
            this.initCE();
        }
        if (editor === "8") {
            this.initJE();
        }
        if (editor === "10")
            this.initOSE();

        $("#" + this.PGobj.wraperId + " .CE-body").off("click", ".colTile").on("click", ".colTile", this.colTileFocusFn.bind(this));
        $("#" + this.CEctrlsContId + " .colTile").off("click", ".close").on("click", ".close", this.colTileCloseFn);
        $(this.pgCXE_Cont_Slctr).off("click", "[name=CXE_OK]").on("click", "[name=CXE_OK]", this.CXE_OKclicked.bind(this));
    };

    this.initCE = function () {
        var CEbody = '<div class="CE-body">'
            + '<table class="table table-bordered editTbl">'
            + '<tbody>'
            + '<tr>'
            + '<td style="padding: 0px;">'
            + '<div class="CE-controls-head" >' + (this.PGobj.Metas[this.PGobj.propNames.indexOf(this.CurProp.toLowerCase())].alias || this.CurProp) + ' </div>'
            + '<div id="' + this.CEctrlsContId + '" class="CEctrlsCont"></div>'
            + '</td>'
            + '<td style="padding: 0px;"><div id="' + this.PGobj.wraperId + '_InnerPG' + '" class="inner-PG-Cont"><div></td>'
            + '</tr>'
            + '</tbody>'
            + '</table>'
            + '</div>';
        var DD_html = '<div class="sub-controls-DD-cont pull-left">'
            + '<select class="selectpicker"> </select>'
            + '<button type="button" class="CE-add" ><i class="fa fa-plus" aria-hidden="true"></i></button>'
            + '</div>';

        $(this.pgCXE_Cont_Slctr + " .modal-title").text("Collection Editor");
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(CEbody);
        $(this.pgCXE_Cont_Slctr + " .modal-footer .modal-footer-body").append(DD_html);
        this.CE_PGObj = new Eb_PropertyGrid(this.PGobj.wraperId + "_InnerPG");
        this.setColTiles();///a
        new dragula([document.getElementById(this.CEctrlsContId)]);
    };

    this.initJE = function () {
        var JEbody = '<textarea id="JE_txtEdtr' + this.PGobj.wraperId + '" rows="12" cols="40" ></textarea>'
        $(this.pgCXE_Cont_Slctr + " .modal-title").text("Javascript Editor");
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(JEbody);
        CodeMirror.commands.autocomplete = function (cm) { CodeMirror.showHint(cm, CodeMirror.hint.javascript); };
        window.editor = CodeMirror.fromTextArea(document.getElementById('JE_txtEdtr' + this.PGobj.wraperId), {
            mode: "javascript",
            lineNumbers: true,
            lineWrapping: true,
            extraKeys: { "Ctrl-Space": "autocomplete" },
            foldGutter: {
                rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment)
            },
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
    };

    this.initOSE = function () {
        var OSEbody = '<div class="OSE-body">'
            + '<table class="table table-bordered editTbl">'
            + '<tbody>'
            + '<tr>'
            + '<td style="padding: 0px;">'
            + '<div class="OSE-DD-cont" > '
            + '<select class="selectpicker">'
            + '</select>'
            + '</div>'
            + '<div class="OSEctrlsCont"> </div>'
            + '</td>'
            + '<td style="padding: 0px;">'
            + '<div class="CE-controls-head"> Versions </div>'
            + '<div class="OSE-verTile-Cont"> </div>'
            + '</td> '
            + '</tr>'
            + '</tbody>'
            + '</table>'
            + '</div>';
        $(this.pgCXE_Cont_Slctr + " .modal-title").text("Object Selector");
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(OSEbody);
        var options = "";
        var ObjTypes = this.PGobj.Metas[this.PGobj.propNames.indexOf(this.CurProp.toLowerCase())].options;
        if (ObjTypes !== null)
            for (var i = 0; i < ObjTypes.length; i++) { options += '<option obj-type="' + EbObjectTypes[ObjTypes[i]] + '">' + ObjTypes[i] + '</option>' }
        else
            console.error("meta.options null for " + this.CurProp + " Check C# Decoration");
        $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").empty().append(options).selectpicker('refresh');
        $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").selectpicker().on('change', this.getOSElist.bind(this));
        var CurRefId = $("#" + this.PGobj.wraperId + " [name=" + this.CurProp + "Tr]").find("input").val();
        var $CXbtn = $("#" + this.PGobj.wraperId + " [name=" + this.CurProp + "Tr] .pgCX-Editor-Btn");
        if (CurRefId) {
            var ObjType = CurRefId.split("-")[2];
            var ObjName = $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker [obj-type=" + ObjType + "]").text();

            var $selectedOpt = $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").find("option:selected");

            if (ObjName === $selectedOpt.text())
                this.getOSElist();
            else
                $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont a:contains(" + ObjName + ")").click();
        }
        else
            this.getOSElist();
    };

    this.getOSElist = function () {
        var $CXbtn = $("#" + this.PGobj.wraperId + " [name=" + this.CurProp + "Tr] .pgCX-Editor-Btn");
        var $selectedOpt = $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").find("option:selected");
        $CXbtn.attr("objtype-name", $selectedOpt.text());///
        var ObjType = $selectedOpt.attr("obj-type");

        if (!this.PGobj.OSElist[ObjType]) {
            $.LoadingOverlay("show");
            $.ajax({
                url: "../DV/FetchAllDataVisualizations",
                type: "POST",
                data: { type: $selectedOpt.text() },
                success: this.biuldObjList
            });
        }
        else
            this.biuldObjList(this.PGobj.OSElist[ObjType]);
    }.bind(this);

    this.biuldObjList = function (data) {
        $.LoadingOverlay("hide");
        var ObjType = null;
        $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont").empty();
        $.each(data, function (name, val) {
            $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont").append('<div class="colTile" tabindex="1" name ="' + name + '">' + name
                + '<i class="fa fa-chevron-right pull-right ColT-right-arrow"  aria-hidden="true"></i></div>');
            ObjType = val[0].refId.split("-")[2];
        }.bind(this));
        this.PGobj.OSElist[ObjType] = data;
        $(this.pgCXE_Cont_Slctr + " .OSE-body .colTile").off("click").on("click", this.OTileClick.bind(this, data));
        $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").off("click").on("click", ".colTile", this.VTileClick.bind(this, data));
        if ($(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .filter-option .fa-refresh").length === 0) {
            var $refresh = $('<i class="fa fa-refresh DD-refresh" aria-hidden="true"></i>').on("click", this.refreshDD.bind(this));
            $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .filter-option").append($refresh);
        }
        var $CXbtn = $("#" + this.PGobj.wraperId + " [name=" + this.CurProp + "Tr] .pgCX-Editor-Btn");
        var CurRefId = $("#" + this.PGobj.wraperId + " [name=" + this.CurProp + "Tr]").find("input").val();
        var objName = $CXbtn.attr("obj-name") || this.getOBjNameByval(data, CurRefId);
        if (CurRefId) {
            if ($(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile:contains(" + objName + ")").length > 0)// need to change
                $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile:contains(" + objName + ")").focus()[0].click();
            else
                $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").empty();
        }

    }.bind(this);

    this.getOBjNameByval = function (data, refId) {
        var ObjName = null;
        var f = false;
        for (objName in data) {
            $.each(data[objName], function (i, obj) {
                if (obj.refId === refId) {
                    ObjName = obj.name;
                    f = true;
                    this.OSECurObj = obj;
                    return ObjName;
                }
            }.bind(this));
            if (f)
                break;
        }
        return ObjName;
    };

    this.OTileClick = function (data) {
        var ObjName = event.target.getAttribute("name");
        $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile").attr("is-selected", false).find(".fa-chevron-right").css("visibility", "hidden");
        $(event.target).attr("is-selected", true).find(".fa-chevron-right").css("visibility", "visible");
        $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").empty();
        $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").attr("for", ObjName);
        $.each(data[ObjName], function (i, obj) {
            $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").append('<div class="colTile" tabindex="1" ver-no="' + obj.versionNumber + '" data-refid="' + obj.refId + '">' + obj.versionNumber
                + '<i class="fa fa-check pull-right" style="display:none; color:#5cb85c; font-size: 18px;" aria-hidden="true"></i></div>');
        }.bind(this));
        var $CXbtn = $("#" + this.PGobj.wraperId + " [name=" + this.CurProp + "Tr] .pgCX-Editor-Btn");
        if ($CXbtn.attr("obj-name")) {
            if ($CXbtn.attr("obj-name") === $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").attr("for"))///////////////////////////////////
                $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont .colTile:contains(" + $CXbtn.attr("ver-name") + ")")[0].click();
        }
        else {
            if (this.OSECurObj)
                $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont [ver-no=" + this.OSECurObj.versionNumber + "]")[0].click();
        }
    };
    this.VTileClick = function () {
        $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont .colTile").attr("is-selected", false).find(".fa-check").hide();
        var refId = $(event.target).attr("data-refid");
        this.PGobj.PropsObj[this.CurProp] = refId;
        $("#" + this.PGobj.wraperId + " [name=" + this.CurProp + "Tr]").find("input").val(refId);
        $(event.target).attr("is-selected", true).find(".fa-check").show();
        var ObjName = $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").attr("for");
        $("#" + this.PGobj.wraperId + ".pgCX-Editor-Btn,[for=" + this.CurProp + "]").attr("obj-name", ObjName);//
        $("#" + this.PGobj.wraperId + ".pgCX-Editor-Btn,[for=" + this.CurProp + "]").attr("ver-name", $(event.target).text());//
    };

    this.refreshDD = function (e) {
        e.stopPropagation();
        var $selectedOpt = $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").find("option:selected");
        var ObjType = $selectedOpt.attr("obj-type");
        this.PGobj.OSElist[ObjType] = null;
        this.getOSElist();
    };

    this.setColTiles = function () {
        if (this.CurProp === "Controls")
            var values = this.PGobj.PropsObj.Controls.$values;
        else
            var values = this.PGobj.PropsObj[this.CurProp];
        var options = "";
        var SubTypes = this.PGobj.Metas[this.PGobj.propNames.indexOf(this.CurProp.toLowerCase())].options;
        $("#" + this.CEctrlsContId).empty();
        if (SubTypes) {
            $.each(values, function (i, control) {
                var type = control.$type.split(",")[0].split(".")[2];
                var $tile = $('<div class="colTile" id="' + control.EbSid + '" tabindex="1" eb-type="' + type + '" onclick="$(this).focus()"><i class="fa fa-arrows" aria-hidden="true" style="padding-right: 5px; font-size:10px;"></i>'
                    + control.Name
                    + '<button type="button" class="close">&times;</button>'
                    + '</div>');
                $("#" + this.CEctrlsContId).append($tile);
                this.colTileFocusFn({ "target": $("#" + control.EbSid).click()[0] });//hack

            }.bind(this));

            for (var i = 0; i < SubTypes.length; i++) { options += '<option>' + SubTypes[i] + '</option>' }
        }
        $(this.pgCXE_Cont_Slctr + " .modal-footer .selectpicker").empty().append(options).selectpicker('refresh');
    };

    this.colTileCloseFn = function (e) {
        e.stopPropagation();
        $(e.target).parent().remove();
    };

    this.colTileFocusFn = function (e) {
        var $e = $(e.target);
        var id = $e.attr("id");
        var obj = null;
        if (this.CurProp === "Controls")
            obj = this.PropsObj.Controls.GetByName(id);
        else
            obj = this.PGobj.PropsObj[this.CurProp].filter(function (obj) { return obj.EbSid == $e.attr("id"); })[0];
        this.CE_PGObj.setObject(obj, AllMetas[$(e.target).attr("eb-type")]);
    };

    this.CE_AddFn = function () {
        var SelType = $(this.pgCXE_Cont_Slctr + " .modal-footer .sub-controls-DD-cont").find("option:selected").val();
        var EbSid = null;
        if (this.CurProp === "Controls") {
            EbSid = this.PGobj.PropsObj.EbSid + "_" + SelType + this.PGobj.PropsObj.Controls.$values.length;
            this.PGobj.PropsObj.Controls.$values.push(new EbObjects[SelType](EbSid));
        }
        else {
            EbSid = this.PGobj.PropsObj.EbSid + "_" + SelType + this.PGobj.PropsObj[this.CurProp].length;
            this.PGobj.PropsObj[this.CurProp].push(new EbObjects[SelType](EbSid));
        }
        this.setColTiles();
        $("#" + EbSid).click();
    };

    this.Init = function () {
        var CXVE_html = '<div class="pgCollEditor-bg">'
            + '<div class="pgCXEditor-Cont">'

            + '<div class="modal-header">'
            + '<button type="button" class="close" onclick="$(\'#' + this.PGobj.wraperId + ' .pgCollEditor-bg\').hide();" >&times;</button>'
            + '<h4 class="modal-title"> </h4>'
            + '</div>'

            + '<div class="modal-body"> </div>'
            + '<div class="modal-footer">'
            + '<div class="modal-footer-body">'
            + '</div>'
            + '<button type="button" name="CXE_OK" class="btn"  onclick="$(\'#' + this.PGobj.wraperId + ' .pgCollEditor-bg\').hide();">OK</button>'
            + '</div>'

            + '</div>'
            + '</div>';
        $(this.PGobj.$wraper).append(CXVE_html);
        $(this.pgCXE_Cont_Slctr).on("click", ".CE-add", this.CE_AddFn.bind(this));
    }
    this.Init();
};