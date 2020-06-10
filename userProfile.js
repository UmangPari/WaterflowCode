// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

class UserProfile {
    constructor(info, app, api) {
        this.info = info;
        
        this.app=app;

        this.api=api;
    }
}

module.exports.UserProfile = UserProfile;
