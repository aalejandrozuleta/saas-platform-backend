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
exports.BaseMetricsService = void 0;
const common_1 = require("@nestjs/common");
const prom_client_1 = require("prom-client");
const DEFAULT_BUCKETS = [0.01, 0.025, 0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1, 2, 3, 5];
let BaseMetricsService = class BaseMetricsService {
    constructor(serviceName, buckets = DEFAULT_BUCKETS) {
        this.serviceName = serviceName;
        this.registry = new prom_client_1.Registry();
        this.registry.setDefaultLabels({ service: this.serviceName });
        (0, prom_client_1.collectDefaultMetrics)({ register: this.registry });
        this.httpRequestCounter = new prom_client_1.Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status', 'service'],
            registers: [this.registry],
        });
        this.httpRequestDuration = new prom_client_1.Histogram({
            name: 'http_request_duration_seconds',
            help: 'HTTP request duration in seconds',
            labelNames: ['method', 'route', 'status', 'service'],
            buckets,
            registers: [this.registry],
        });
        this.httpRequestsInFlight = new prom_client_1.Gauge({
            name: 'http_requests_in_flight',
            help: 'Current HTTP requests being processed',
            labelNames: ['service'],
            registers: [this.registry],
        });
    }
    getServiceName() {
        return this.serviceName;
    }
    async getMetrics() {
        return this.registry.metrics();
    }
    getContentType() {
        return this.registry.contentType;
    }
};
exports.BaseMetricsService = BaseMetricsService;
exports.BaseMetricsService = BaseMetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String, Array])
], BaseMetricsService);
