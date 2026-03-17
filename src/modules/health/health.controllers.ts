export default class HealthController {
    healthCheck() {
        return {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: Date.now(),
        };
    }
}
