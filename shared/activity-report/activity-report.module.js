"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ActivityReportMongoModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityReportMongoModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const activity_report_mongo_repository_1 = require("./activity-report-mongo.repository");
const activity_report_service_1 = require("./activity-report.service");
const activity_report_tokens_1 = require("./activity-report.tokens");
const activity_report_schema_1 = require("./activity-report.schema");
let ActivityReportMongoModule = ActivityReportMongoModule_1 = class ActivityReportMongoModule {
    static register(options = {}) {
        const collection = options.collection ?? activity_report_schema_1.DEFAULT_ACTIVITY_REPORT_COLLECTION;
        return {
            module: ActivityReportMongoModule_1,
            imports: [
                mongoose_1.MongooseModule.forFeature([
                    {
                        name: activity_report_schema_1.ActivityReportDocument.name,
                        schema: (0, activity_report_schema_1.createActivityReportSchema)(collection),
                    },
                ]),
            ],
            providers: [
                activity_report_mongo_repository_1.ActivityReportMongoRepository,
                activity_report_service_1.ActivityReportService,
                {
                    provide: activity_report_tokens_1.ACTIVITY_REPORT_REPOSITORY,
                    useExisting: activity_report_mongo_repository_1.ActivityReportMongoRepository,
                },
                {
                    provide: activity_report_tokens_1.ACTIVITY_REPORTER,
                    useExisting: activity_report_service_1.ActivityReportService,
                },
            ],
            exports: [activity_report_tokens_1.ACTIVITY_REPORT_REPOSITORY, activity_report_tokens_1.ACTIVITY_REPORTER],
        };
    }
};
exports.ActivityReportMongoModule = ActivityReportMongoModule;
exports.ActivityReportMongoModule = ActivityReportMongoModule = ActivityReportMongoModule_1 = __decorate([
    (0, common_1.Module)({})
], ActivityReportMongoModule);
