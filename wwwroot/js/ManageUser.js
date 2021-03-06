﻿var UserJs = function (usr, sysroles, usergroup, uroles, ugroups, r2rList) {
    this.user = usr;
    this.systemRoles = sysroles;
    this.userGroup = usergroup;
    this.U_Roles = uroles;
    this.U_Groups = ugroups;
    this.r2rList = r2rList;
    this.itemId = $("#userid").val();
    this.dependentList = [];
    
    this.divFormHeading = $("#divFormHeading");
    this.txtName = $("#txtName");
    this.txtNickName = $("#txtNickName");
    this.txtEmail = $("#txtEmail");
    this.divPassword = $("#divPassword");

    this.rolesTile = null;
    this.userGroupTile = null;

    //this.txtSearchRole = $("#txtSearchRole");
    //this.btnModalOk = $("#btnModalOk");
    //this.divRoleSearchResults = $("#divRoleSearchResults");
    //this.divSelectedRoleDisplay = $("#divSelectedRoleDisplay");
    //this.txtDemoRoleSearch = $("#txtDemoRoleSearch");
    //this.btnClearDemoRoleSearch = $("#btnClearDemoRoleSearch");

    //this.txtSearchUserGroup = $("#txtSearchUserGroup");
    //this.btnUserGroupModalOk = $("#btnUserGroupModalOk");
    //this.divUserGroupSearchResults = $("#divUserGroupSearchResults");
    //this.divSelectedUserGroupDisplay = $("#divSelectedUserGroupDisplay");
    //this.txtDemoUserGroupSearch = $("#txtDemoUserGroupSearch");
    //this.btnClearDemoUserGroupSearch = $("#btnClearDemoUserGroupSearch");

    this.init = function () {
        //this.txtSearchRole.on('keyup', this.KeyUptxtSearchRole.bind(this));
        //this.btnModalOk.on('click', this.clickbtnModalOkAction.bind(this));
        //$('#addRolesModal').on('shown.bs.modal', this.initModal1.bind(this));
        //this.txtDemoRoleSearch.on('keyup', this.KeyUptxtDemoRoleSearch.bind(this));
        //this.btnClearDemoRoleSearch.on('click', this.OnClickbtnClearDemoRoleSearch.bind(this));

        //this.txtSearchUserGroup.on('keyup', this.KeyUptxtSearchUserGroup.bind(this));
        //this.btnUserGroupModalOk.on('click', this.clickbtnUserGroupModalOkAction.bind(this));
        //$('#addUserGroupModal').on('shown.bs.modal', this.initModal2.bind(this));
        //this.txtDemoUserGroupSearch.on('keyup', this.KeyUptxtDemoUserGroupSearch.bind(this));
        //this.btnClearDemoUserGroupSearch.on('click', this.OnClickbtnClearDemoUserGroupSearch.bind(this));

        $('#btnCreateUser').on('click', this.clickbtnCreateUser.bind(this));

        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            $("#btnCreateUser").focus();
        });
       
        this.initForm();
        this.initTiles();
    }

    this.initForm = function () {
        if (this.itemId > 0) {
            $(divFormHeading).text("Edit User");
            $(btnCreateUser).text("Update");
            this.txtName.attr("disabled", "true");
            this.txtNickName.attr("disabled", "true");
            this.txtEmail.attr("disabled", "true");
            this.divPassword.css("display", "none");
        }
        else {
            $(divFormHeading).text("Create User");
        }
    }

    this.findDependentRoles = function (dominant) {
        for (var i = 0; i < this.r2rList.length; i++) {
            if (this.r2rList[i].Dominant == dominant) {
                this.dependentList.push(this.r2rList[i].Dependent);
                this.findDependentRoles(this.r2rList[i].Dependent);
            }
        }
    }

    this.chkItemCustomFunc = function (_this, e) {
        _this.dependentList = [];
        if ($(e.target).is(':checked')) {
            _this.findDependentRoles($(e.target).attr("data-id"));
            var st = "";
            var itemid = [];
            $.each($(this.divSelectedDisplay).children(), function (i, ob) {
                for (var i = 0; i < _this.dependentList.length; i++) {
                    if (_this.dependentList[i] == $(ob).attr('data-id')) {
                        st += '\n' + $(ob).attr('data-name');
                        itemid.push($(ob).attr('data-id'));
                    }
                }
            });
            if (st !== '') {
                if (confirm("Continuing this Operation will Remove the following Item(s)" + st + "\n\nClick OK to Continue")) {
                    for (i = 0; i < itemid.length; i++) {
                        $(this.divSelectedDisplay).children("[data-id='" + itemid[i] + "']").remove();
                    }
                }
                else {
                    $(e.target).removeAttr("checked");
                }
            }
        }

        $.each($(this.divSearchResults).find('.SearchCheckbox:checked'), function (i, ob) {
            _this.findDependentRoles($(ob).attr('data-id'));
        });
        $.each($(this.divSelectedDisplay).children(), function (i, ob) {
            _this.dependentList.push(parseInt($(ob).attr('data-id')));
            _this.findDependentRoles($(ob).attr('data-id'));
        });
        $.each($(this.divSearchResults).find('input'), function (i, ob) {
            if (_this.dependentList.indexOf(parseInt($(ob).attr('data-id'))) !== -1) {
                $(ob).removeAttr("checked");
                $(ob).attr("disabled", "true");
            }
            else
                $(ob).removeAttr("disabled");

            if ($(this.divSelectedDisplay).children("[data-id=" + $(ob).attr('data-id') + "]").length > 0) {
                $(ob).attr("disabled", "true");
                $(ob).prop("checked", "true");
            }

        }.bind(this));
    }

    this.initTiles = function () {
        //INIT ROLES
        var metadata1 = ['Id', 'Name', 'Description'];
        var initroles = [];
        if (this.U_Roles !== null)
            for (var i = 0; i < this.user.length; i++)
                if (this.U_Roles.indexOf(this.user[i].Id) !== -1)
                    initroles.push(this.user[i]);
        this.rolesTile = new TileSetupJs($("#menu1"), "Add Roles", initroles, this.user, metadata1, null, this.chkItemCustomFunc, this);

        //INIT USER GROUPS
        var initgroups = [];
        if (this.U_Groups !== null)
            for (var i = 0; i < this.userGroup.length; i++)
                if (this.U_Groups.indexOf(this.userGroup[i].Id) !== -1)
                    initgroups.push(this.userGroup[i]);
        this.userGroupTile = new TileSetupJs($("#menu3"), "Add User Group", initgroups, this.userGroup, metadata1, null, null, this);
    }

    this.clickbtnCreateUser = function () {
        var selectedroles = this.rolesTile.getItemIds();
        var selectedusergroups = this.userGroupTile.getItemIds();
        $("#btnCreateUser").attr("disabled", "true");
        $.post("../Security/SaveUser",
            {
                "userid": $('#userid').val(),
                "roles": selectedroles,
                "usergroups": selectedusergroups,
                "firstname": $('#txtName').val(),
                "email": $('#txtEmail').val(),
                "Pwd": $('#pwdPaasword').val()
            }, function (result) {
                if (result > -1){
                    alert("Saved Successfully");
                    window.top.close();
                }
                $("#btnCreateUser").removeAttr("disabled");
            });
    }

    //this.initModal1 = function () {
    //    this.txtSearchRole.focus();
    //    this.KeyUptxtSearchRole();
    //}
    //this.initModal2 = function () {
    //    this.txtSearchUserGroup.focus();
    //    this.KeyUptxtSearchUserGroup();
    //}

    //this.KeyUptxtSearchRole = function () {
    //    this.drawSearchResults(1);
    //}
    //this.clickbtnModalOkAction = function () {
    //    this.drawSelectedDisplay(1);
    //    $('#addRolesModal').modal('toggle');
    //    this.SortDiv(1);
    //}

    //this.KeyUptxtSearchUserGroup = function () {
    //    this.drawSearchResults(2);
    //}
    //this.clickbtnUserGroupModalOkAction = function () {
    //    this.drawSelectedDisplay(2);
    //    $('#addUserGroupModal').modal('toggle');
    //    this.SortDiv(2);
    //}

    //this.drawSearchResults = function (flag) {
    //    var st = null;
    //    var txt = null;
    //    var divSelectedDisplay;
    //    var divSearchResults;
    //    if (flag === 1) {
    //        obj = this.user;
    //        $("#divRoleSearchResults").children().remove();
    //        txt = $("#txtSearchRole").val().trim();
    //        divSelectedDisplay = $("#divSelectedRoleDisplay");
    //        divSearchResults = $("#divRoleSearchResults");
    //    }
    //    else if (flag === 2) {
    //        obj = this.userGroup;
    //        $("#divUserGroupSearchResults").children().remove();
    //        txt = $("#txtSearchUserGroup").val().trim();
    //        divSelectedDisplay = $("#divSelectedUserGroupDisplay");
    //        divSearchResults = $("#divUserGroupSearchResults");
    //    }
    //    else
    //        return;

    //    for (var i = 0; i < obj.length; i++) {
    //        if (obj[i].Name.substr(0, txt.length).toLowerCase() === txt.toLowerCase()) {
    //            if ($(divSelectedDisplay).find(`[data-id='${obj[i].Id}']`).length > 0)
    //                st = "checked disabled";
    //            else
    //                st = null;
    //            this.appendToSearchResult(divSearchResults, st, obj[i]);
    //        }
    //    }
    //}

    //this.appendToSearchResult = function (divSearchResults, st, obj) {
    //    $(divSearchResults).append(`<div class='row searchRsulsItemsDiv' style='margin-left:5px; margin-right:5px' data-id=${obj.Id}>
    //                                    <div class='col-md-1' style="padding:10px">
    //                                        <input type ='checkbox' ${st} data-name = '${obj.Name}' data-id = '${obj.Id}' data-d = '${obj.Description}' aria-label='...'>
    //                                    </div>
    //                                    <div class='col-md-10'>
    //                                        <h5 name = 'head5' style='color:black;'>${obj.Name}</h5>
    //                                        ${obj.Description}
    //                                    </div>
    //                                </div>`);
    //}
       
    //this.drawSelectedDisplay = function (flag) {
    //    var addModal;
    //    var divSearchResultsChecked;
    //    var divSelectedDisplay;
    //    if (flag === 1) {
    //        divSearchResultsChecked = $('#divRoleSearchResults input:checked');
    //        divSelectedDisplay = $('#divSelectedRoleDisplay');
    //        addModal = $('#addRolesModal');
    //    }
    //    else if (flag === 2) {
    //        divSearchResultsChecked = $('#divUserGroupSearchResults input:checked');
    //        divSelectedDisplay = $('#divSelectedUserGroupDisplay');
    //        addModal = $('#addUserGroupModal');
    //    }
    //    else
    //        return;
    //    $(divSearchResultsChecked).each(function () {
    //        if (($(divSelectedDisplay).find(`[data-id='${$(this).attr('data-id')}']`).length) === 0) {
    //            $(divSelectedDisplay).append(`<div class="col-md-4 container-md-4" data-id=${$(this).attr('data-id')} data-name=${$(this).attr('data-name')}>
    //                                                <div class="mydiv1" style="overflow:visible;">
    //                                                    <div class="icondiv1">
    //                                                         <b>${$(this).attr('data-name').substring(0, 1).toUpperCase()}</b>
    //                                                    </div>
    //                                                    <div class="textdiv1">
    //                                                        <b>${$(this).attr('data-name')}</b>
    //                                                        <div style="font-size: smaller;">&nbsp${$(this).attr('data-d')}</div>
    //                                                    </div>
    //                                                    <div class="closediv1">
    //                                                        <div class="dropdown">
    //                                                            <i class="fa fa-ellipsis-v dropdown-toggle" aria-hidden="true" data-toggle="dropdown" style="padding:0px 5px"></i>
    //                                                            <ul class="dropdown-menu" style="left:-140px;">
    //                                                                <li><a href="#" onclick="OnClickRemove(this);">Remove</a></li>
    //                                                            </ul>
    //                                                        </div>
    //                                                    </div>
    //                                                </div>
    //                                                </div>`);
    //        }
    //    });
        
    //}

    //this.SortDiv = function (flag) {
    //    var mylist;
    //    if (flag === 1) 
    //        mylist = $('#divSelectedRoleDisplay');
    //    else if (flag === 2)
    //        mylist = $('#divSelectedUserGroupDisplay');
    //    else
    //        return;
    //    var listitems = mylist.children('div').get();
    //    listitems.sort(function (a, b) {
    //        return $(a).attr("data-name").toUpperCase().localeCompare($(b).attr("data-name").toUpperCase());
    //    });
    //    $.each(listitems, function (index, item) {
    //        mylist.append(item);
    //    });
    //}
        
    //this.KeyUptxtDemoRoleSearch = function () {
    //    this.keyUpTxtDemoSearch(1);
    //}
    //this.KeyUptxtDemoUserGroupSearch = function () {
    //    this.keyUpTxtDemoSearch(2);
    //}

    //this.keyUpTxtDemoSearch = function (flag) {
    //    var f = 1;
    //    var txt;
    //    var divSelectedDisplay;
    //    if (flag === 1) {
    //        txt = $("#txtDemoRoleSearch").val().trim();
    //        divSelectedDisplay = $("#divSelectedRoleDisplay");
    //    }
    //    else if (flag === 2) {
    //        txt = $("#txtDemoUserGroupSearch").val().trim();
    //        divSelectedDisplay = $("#divSelectedUserGroupDisplay");
    //    }
    //    else
    //        return;
    //    $($(divSelectedDisplay).children("div.col-md-4")).each(function () {
    //        $(this).children().css('box-shadow', '1px 1px 2px 1px #fff');
    //        if ($(this).attr('data-name').toLowerCase().substring(0, txt.length) === txt.toLowerCase() && txt !== "") {
    //            $(this).children().css('box-shadow', '1px 1px 2px 1px red');
    //            //scroll to search result
    //            if (f) {
    //                var elem = $(this);
    //                if (elem) {
    //                    var main = $(divSelectedDisplay);
    //                    var t = main.offset().top;
    //                    main.scrollTop(elem.offset().top - t);
    //                }
    //                f = 0;
    //            }
    //        }
    //    });
    //}

    //this.OnClickbtnClearDemoRoleSearch = function () {
    //    $("#txtDemoRoleSearch").val("");
    //    this.KeyUptxtDemoRoleSearch();
    //}
    //this.OnClickbtnClearDemoUserGroupSearch = function () {
    //    $("#txtDemoUserGroupSearch").val("");
    //    this.KeyUptxtDemoUserGroupSearch();
    //}

    

    //this.loadUserRoles = function () {
    //    obj = this.user;
    //    obj2 = this.userGroup;
    //    uroles = this.U_Roles;
    //    ugroups = this.U_Groups;
    //    $("#divRoleSearchResults").children().remove();
    //    $("#divUserGroupSearchResults").children().remove();
    //    var i, st;
    //    for (i = 0; i < obj.length; i++) {
    //        st = null;
    //        if ($.grep(uroles, function (e) { return e === obj[i].Id; }).length > 0)
    //            st = "checked disabled";
    //        this.appendToSearchResult($("#divRoleSearchResults"), st, obj[i]);
    //    }
    //    this.drawSelectedDisplay(1);
    //    for (i = 0; i < obj2.length; i++) {
    //        st = null;
    //        if ($.grep(ugroups, function (e) { return e === obj2[i].Id; }).length > 0)
    //            st = "checked disabled";
    //        this.appendToSearchResult($("#divUserGroupSearchResults"), st, obj2[i]);
    //    }
    //    this.drawSelectedDisplay(2);
    //}

    this.init();
}