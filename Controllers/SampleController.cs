﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Objects;
using ExpressBase.ServiceStack.Services;
using Microsoft.AspNetCore.Http;
using ExpressBase.Data;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.ServiceStack
{
    public class SampleController : Controller
    {
        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }


        public IActionResult GetData()
        {
            return View();
        }

        public string sample()
        {

            return "{'name':'haii'}";
        }

        public IActionResult Table()
        {
            return View();
        }
        public IActionResult Masterhome()
        {
            return View();
        }

        //[ValidateAntiForgeryToken]
        public IActionResult RForm(int id)
        {
            ViewBag.FormId = id;
            return View();
        }
        
    }
}