"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActivityReportSchema = exports.ActivityReportDocument = exports.DEFAULT_ACTIVITY_REPORT_COLLECTION = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
exports.DEFAULT_ACTIVITY_REPORT_COLLECTION = 'user_activity_reports';
const ACTIVITY_OUTCOMES = [
    'INFO',
    'SUCCESS',
    'FAILURE',
    'BLOCKED',
    'REJECTED',
];
let ActivityReportDocument = class ActivityReportDocument extends mongoose_2.Document {
};
exports.ActivityReportDocument = ActivityReportDocument;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ActivityReportDocument.prototype, "service", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ActivityReportDocument.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ActivityReportDocument.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        index: true,
        type: String,
        enum: ACTIVITY_OUTCOMES,
    }),
    __metadata("design:type", String)
], ActivityReportDocument.prototype, "outcome", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ActivityReportDocument.prototype, "summary", void 0);
__decorate([
    (0, mongoose_1.Prop)((0, mongoose_1.raw)({
        type: { type: String, required: true },
        id: { type: String, required: false },
        email: { type: String, required: false },
        name: { type: String, required: false },
    })),
    __metadata("design:type", Object)
], ActivityReportDocument.prototype, "actor", void 0);
__decorate([
    (0, mongoose_1.Prop)((0, mongoose_1.raw)({
        ip: { type: String, required: false },
        country: { type: String, required: false },
        deviceFingerprint: { type: String, required: false },
        userAgent: { type: String, required: false },
        requestId: { type: String, required: false },
    })),
    __metadata("design:type", Object)
], ActivityReportDocument.prototype, "context", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ActivityReportDocument.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], ActivityReportDocument.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", Date)
], ActivityReportDocument.prototype, "createdAt", void 0);
exports.ActivityReportDocument = ActivityReportDocument = __decorate([
    (0, mongoose_1.Schema)({
        versionKey: false,
        timestamps: false,
    })
], ActivityReportDocument);
const baseActivityReportSchema = mongoose_1.SchemaFactory.createForClass(ActivityReportDocument);
baseActivityReportSchema.index({
    service: 1,
    createdAt: -1,
});
baseActivityReportSchema.index({
    'actor.id': 1,
    createdAt: -1,
});
baseActivityReportSchema.index({
    category: 1,
    action: 1,
    createdAt: -1,
});
baseActivityReportSchema.index({
    outcome: 1,
    createdAt: -1,
});
const createActivityReportSchema = (collection = exports.DEFAULT_ACTIVITY_REPORT_COLLECTION) => {
    const schema = baseActivityReportSchema.clone();
    schema.set('collection', collection);
    return schema;
};
exports.createActivityReportSchema = createActivityReportSchema;
