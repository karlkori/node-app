"use strict";

import { expect, should } from "chai";
import TaskService from "../api/services/TaskService";
import Task from "../api/models/Task";
import nock from "nock";
import config from "../config/app";

describe("TaskService", async () => {
    before(async () => {
        /* clear tasks in database */
        await Task.remove({});
    });

    describe("sync", async () => {
        it("should create 2 new tasks", async (done) => {
            let response = {
                "data": {
                    "vens": [
                        {
                            "certificate": "-----BEGIN ENCRYPTED PRIVATE KEY-----\n-----END ENCRYPTED PRIVATE KEY-----",
                            "createdAt": "2016-12-12T13:48:30.473Z",
                            "password": "password",
                            "privateKey": "-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----",
                            "updatedAt": "2016-12-12T13:53:32.683Z",
                            "uri": "openadr.sce.com",
                            "username": "username",
                            "vtnId": "honeywell.vtn.com",
                            "certificateFilename": "certificate.pem",
                            "privateKeyFilename": "private-key.pem",
                            "id": "584eaaae91a40c2c7331b19c"
                        }
                    ],
                    "groups": [
                        {
                            "ven": "584eaaae91a40c2c7331b19c",
                            "id": "5822e38fcc30d7de1567f362",
                            "title": "SITE",
                            "enabled": true,
                            "groupId": "",
                            "marketContextId": "",
                            "partyId": "",
                            "resourceId": "",
                            "venId": "venId-xxx",
                            "pollingFrequency": 25
                        },
                        {
                            "ven": "584eaaae91a40c2c7331b19c",
                            "id": "5822e38fcc30d7de1567f361",
                            "title": "SITE 2",
                            "enabled": true,
                            "groupId": "",
                            "marketContextId": "",
                            "partyId": "",
                            "resourceId": "",
                            "venId": "venId-yyy",
                            "pollingFrequency": 15
                        }
                    ]
                }
            };

            nock(config.joninApiEndpoint)
                .get("/openadr/groups")
                .reply(200, response);

            try {
                await TaskService.sync();

                let tasks = await Task.find({}).lean().exec();

                expect(tasks).to.be.a("array").with.length(2);
                tasks.map((task) => {
                   expect(task).to.have.property("actionNeed");
                   expect(task.actionNeed).to.equal("create");
                });

                /** set all tasks to done */
                await Task.update({}, {actionNeed: "none"}, {multi: true});

                done();
            } catch (err) {
                done(err);
            }
        });


        it("should update 1 task", async (done) => {
            let response = {
                "data": {
                    "vens": [
                        {
                            "certificate": "-----BEGIN ENCRYPTED PRIVATE KEY-----\n-----END ENCRYPTED PRIVATE KEY-----",
                            "createdAt": "2016-12-12T13:48:30.473Z",
                            "password": "password",
                            "privateKey": "-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----",
                            "updatedAt": "2016-12-12T13:53:32.683Z",
                            "uri": "openadr.sce.com",
                            "username": "username",
                            "vtnId": "honeywell.vtn.com",
                            "certificateFilename": "certificate.pem",
                            "privateKeyFilename": "private-key.pem",
                            "id": "584eaaae91a40c2c7331b19c"
                        }
                    ],
                    "groups": [
                        {
                            "ven": "584eaaae91a40c2c7331b19c",
                            "id": "5822e38fcc30d7de1567f362",
                            "title": "SITE",
                            "enabled": true,
                            "groupId": "",
                            "marketContextId": "",
                            "partyId": "",
                            "resourceId": "",
                            "venId": "venId-xxx",
                            "pollingFrequency": 15
                        },
                        {
                            "ven": "584eaaae91a40c2c7331b19c",
                            "id": "5822e38fcc30d7de1567f361",
                            "title": "SITE 2",
                            "enabled": true,
                            "groupId": "",
                            "marketContextId": "",
                            "partyId": "",
                            "resourceId": "",
                            "venId": "venId-yyy",
                            "pollingFrequency": 15
                        }
                    ]
                }
            };

            nock(config.joninApiEndpoint)
                .get("/openadr/groups")
                .reply(200, response);

            try {
                await TaskService.sync();

                let tasks = await Task.find({}).lean().exec();

                // console.dir(tasks);

                expect(tasks).to.be.a("array").with.length(2);

                tasks.forEach((task) => {
                    if (task.group.id === "5822e38fcc30d7de1567f362") {
                        expect(task).to.have.property("actionNeed");
                        expect(task.actionNeed).to.equal("update");
                    } else {
                        expect(task).to.have.property("actionNeed");
                        expect(task.actionNeed).to.equal("none");
                    }
                });

                /** set all tasks to done */
                await Task.update({}, {actionNeed: "none"}, {multi: true});

                done();
            } catch (err) {
                done(err);
            }
        });


        it("should update 2 tasks because their VEN was changed", async (done) => {
            let response = {
                "data": {
                    "vens": [
                        {
                            "certificate": "-----BEGIN ENCRYPTED PRIVATE KEY-----\n-----END ENCRYPTED PRIVATE KEY-----",
                            "createdAt": "2016-12-12T13:48:30.473Z",
                            "password": "new-password",
                            "privateKey": "-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----",
                            "updatedAt": "2016-12-12T13:53:32.683Z",
                            "uri": "openadr.sce.com",
                            "username": "username",
                            "vtnId": "honeywell.vtn.com",
                            "certificateFilename": "certificate.pem",
                            "privateKeyFilename": "private-key.pem",
                            "id": "584eaaae91a40c2c7331b19c"
                        }
                    ],
                    "groups": [
                        {
                            "ven": "584eaaae91a40c2c7331b19c",
                            "id": "5822e38fcc30d7de1567f362",
                            "title": "SITE UPDATED",
                            "enabled": true,
                            "groupId": "",
                            "marketContextId": "",
                            "partyId": "",
                            "resourceId": "",
                            "venId": "venId-xxx",
                            "pollingFrequency": 25
                        },
                        {
                            "ven": "584eaaae91a40c2c7331b19c",
                            "id": "5822e38fcc30d7de1567f361",
                            "title": "SITE 2",
                            "enabled": true,
                            "groupId": "",
                            "marketContextId": "",
                            "partyId": "",
                            "resourceId": "",
                            "venId": "venId-yyy",
                            "pollingFrequency": 15
                        }
                    ]
                }
            };

            nock(config.joninApiEndpoint)
                .get("/openadr/groups")
                .reply(200, response);

            try {
                await TaskService.sync();

                let tasks = await Task.find({}).lean().exec();

                expect(tasks).to.be.a("array").with.length(2);

                tasks.forEach((task) => {
                    expect(task).to.have.property("actionNeed");
                    expect(task.actionNeed).to.equal("update");
                });

                /** set all tasks to done */
                await Task.update({}, {actionNeed: "none"}, {multi: true});

                done();
            } catch (err) {
                done(err);
            }
        });


        it("should terminate 1 task", async (done) => {
            let response = {
                "data": {
                    "vens": [
                        {
                            "certificate": "-----BEGIN ENCRYPTED PRIVATE KEY-----\n-----END ENCRYPTED PRIVATE KEY-----",
                            "createdAt": "2016-12-12T13:48:30.473Z",
                            "password": "new-password",
                            "privateKey": "-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----",
                            "updatedAt": "2016-12-12T13:53:32.683Z",
                            "uri": "openadr.sce.com",
                            "username": "username",
                            "vtnId": "honeywell.vtn.com",
                            "certificateFilename": "certificate.pem",
                            "privateKeyFilename": "private-key.pem",
                            "id": "584eaaae91a40c2c7331b19c"
                        }
                    ],
                    "groups": [
                        {
                            "ven": "584eaaae91a40c2c7331b19c",
                            "id": "5822e38fcc30d7de1567f362",
                            "title": "SITE UPDATED",
                            "enabled": true,
                            "groupId": "",
                            "marketContextId": "",
                            "partyId": "",
                            "resourceId": "",
                            "venId": "venId-xxx",
                            "pollingFrequency": 25
                        }
                    ]
                }
            };

            nock(config.joninApiEndpoint)
                .get("/openadr/groups")
                .reply(200, response);

            try {
                await TaskService.sync();

                let tasks = await Task.find({}).lean().exec();

                expect(tasks).to.be.a("array").with.length(2);

                tasks.map((task) => {
                    if (task.group.id === "5822e38fcc30d7de1567f362") {
                        expect(task).to.have.property("actionNeed");
                        expect(task.actionNeed).to.equal("none");
                    } else {
                        expect(task).to.have.property("actionNeed");
                        expect(task.actionNeed).to.equal("terminate");
                    }
                });

                done();
            } catch (err) {
                done(err);
            }
        });
    });
});