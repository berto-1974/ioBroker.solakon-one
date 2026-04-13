import config from '@iobroker/eslint-config';

export default [
    ...config,
    {
        rules: {
            'no-unused-vars': ['warn'],
        },
    },
];
