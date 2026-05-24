import type { VisitParams } from './visitor.schema.js';

export default class VisitorController {
    setInitialCount(params: VisitParams) {
        const { username, page } = params;

        return {
            username,
            page,
        };
    }
}
