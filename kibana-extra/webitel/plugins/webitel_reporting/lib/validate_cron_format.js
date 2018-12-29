import cronParser from 'cron-parser';

export const validateCron = (cronFormat = '') => {
    try {
        cronParser.parseExpression(cronFormat);
        return true
    } catch (e) {
        return false
    }
};