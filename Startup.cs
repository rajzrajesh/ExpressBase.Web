﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ServiceStack;
using Microsoft.AspNetCore.Routing.Constraints;
using ExpressBase.Web.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Http;
using ServiceStack.Redis;
using ExpressBase.Objects.Objects.MQRelated;
using ServiceStack.Messaging.Redis;
using ServiceStack.Messaging;

namespace ExpressBase.Web2
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();

            if (env.IsDevelopment())
            {
                // This will push telemetry data through Application Insights pipeline faster, allowing you to view results immediately.
                builder.AddApplicationInsightsSettings(developerMode: true);
            }
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Add framework services.
            services.AddApplicationInsightsTelemetry(Configuration);

            services.AddMvc();


            services.AddSingleton<AreaRouter>();

            // Added - uses IOptions<T> for your settings.
            services.AddOptions();

            // Added - Confirms that we have a home for our DemoSettings
            services.Configure<EbSetupConfig>(Configuration.GetSection("EbSetupConfig"));

            //services.AddScoped(typeof(IServiceClient), ServiceClientFactory);
            services.AddScoped<IServiceClient, JsonServiceClient>(serviceProvider =>
            {
                var connectionString = Configuration["EbSetupConfig:ServiceStackUrl"];
                return new JsonServiceClient(connectionString);
            });

            var redisServer = Configuration["EbSetupConfig:RedisServer"];
            var redisPassword = Configuration["EbSetupConfig:RedisPassword"];
            var redisPort = Configuration["EbSetupConfig:RedisPort"];

            services.AddScoped<IRedisClient, RedisClient>(serviceProvider =>
            {
                return new RedisClient(string.Format("redis://{0}@{1}:{2}?ssl=true", redisPassword, redisServer, redisPort));
            });

            services.AddScoped<IMessageQueueClient, RedisMessageQueueClient>(serviceProvider =>
            {
                var redisConnectionStringMq = string.Format("redis://{0}@{1}:{2}?ssl=true&db=1",
                    redisPassword, redisServer, redisPort);

                var redisFactory = new PooledRedisClientManager(redisConnectionStringMq);
                var mqHost = new RedisMqServer(redisFactory, retryCount: 2);

                return mqHost.CreateMessageQueueClient() as RedisMessageQueueClient;
            });

            services.AddScoped<IMessageProducer, RedisMessageProducer>(serviceProvider =>
            {
                var redisConnectionStringMq = string.Format("redis://{0}@{1}:{2}?ssl=true&db=1",
                    redisPassword, redisServer, redisPort);

                var redisFactory = new PooledRedisClientManager(redisConnectionStringMq);
                var mqHost = new RedisMqServer(redisFactory, retryCount: 2);

                return mqHost.CreateMessageProducer() as RedisMessageProducer;
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, AreaRouter areaRouter)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            app.UseApplicationInsightsRequestTelemetry();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseApplicationInsightsExceptionTelemetry();

            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.DefaultHandler = areaRouter;
                routes.MapRoute(
                 name: "developer",
                 template: "dev",
                 defaults: new { controller = "Ext", action = "DevSignIn" }
                );

                routes.MapRoute(
                    name: "default",
                    template: "{controller=Ext}/{action=Index}");

            });

          
        }
    }
}
