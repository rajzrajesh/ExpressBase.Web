﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Common.Objects;

namespace ExpressBase.Web.Components
{
    public class ObjectDashboardViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(string refid, string objname, /*int totVer,*/ string status, string desc, bool _readonly, int _type, int major, int minor, int patch)
        {
            ViewBag._Refid = refid;
            ViewBag.ObjName = objname;
            //ViewBag.TotalVersions = totVer;
            ViewBag.Status = status;
            ViewBag.description = desc;
            ViewBag._ReadOnly = _readonly;
            ViewBag._objtype = _type;
            ViewBag._major = major;
            ViewBag._minor = minor;
            ViewBag._patch = patch;
            return View();

        }
    }
}
