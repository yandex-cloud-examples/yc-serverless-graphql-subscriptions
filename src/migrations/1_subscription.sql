CREATE TABLE `subscription`
(
    `connectionId` Utf8,
    `subscriptionId` Utf8,
    `contextValue` Json,
    `document` Json,
    `topic` Utf8,
    `variableValues` Json,
    PRIMARY KEY (`connectionId`, `subscriptionId`)
);
