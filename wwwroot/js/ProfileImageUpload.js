﻿var imageUploader = function (container) {
    this.container = container;
    this.mWid = null;
    this.CreateMOdalW = function () {
        var modalW = $("<div class='modal fade modalstyle' id='up-modal' role='dialog'>"
            + "<div class='modal-dialog modal-lg'>"
            + "<div class='modal-content wstyle' style='border-radius:0;'>"
            + "<div class='modal-header'>"
            + "<h4 class='modal-title' id='exampleModalLabel' style='display: inline-block;'>Upload Image</h4>"
            + "<button type='button' class='close' data-dismiss='modal'>&times;</button>"
            + "</div>"
            + "<div class='modal-body' id='imgUBody' style=''>"
            + "<div class='input-group'><span class='input-group-addon'>Image Id</span>"
            + "<input type='text' id='obj-id' class='form-control'>"
            + "</div>"
            + "<div id-'img-upload-body' style='margin-top:15px;'><input id='input-id' type='file' class='file' data-preview-file-type='text'></div>"
            + "</div>"
            + "<div class='modal-footer' id='mdfooter' style='display:none;height:100px;border:none'></div>"
            + "</div></div></div>");
        $("#" + this.container).append(modalW);

        $("#input-id").fileinput({
            uploadUrl: "../StaticFile/UploadFileAsync",
            maxFileCount: 5,
            initialPreview: [],
            uploadExtraData: this.uploadtag.bind(this)
        }).on('fileuploaded', function (event, data, previewId, index) {
            var objId = data.response.objId;
            $('#obj-id').attr('value', objId);
            $('#imgsrc').val(objId);
            
        });
    };
    //this.addtagButton = function (event, file, previewId, index, reader) {
    //    $("#" + previewId).children().find(".file-footer-buttons").append("<button type='button' id='tagbtn" + previewId + "'"
    //        + "class='kv-file-upload btn btn-kv btn-default btn-outline-secondary' title= 'Tag' > Tag</button > ");
    //    $("#tagbtn" + previewId).on("click", this.tagimageOnClick.bind(this));
    //};

    this.uploadtag = function (previewId, index) {
        this.tagnames = $("#tagval").tagsinput('items');
        return { "tags": this.tagnames };
    };

    //this.tagimageOnClick = function () {
    //    $("#mdfooter").show();
    //    $("#mdfooter").append("<input type= 'text' data-role='tagsinput' id= 'tagval' value='tag' class='form-control'>");
    //    $("#tagval").tagsinput('refresh');
    //};
    //this.addtagAndPrev = function () {
    //    var tagname = $("#tagval").val();
    //};

    this.init = function () {
        this.CreateMOdalW();
    };
    this.init();
}