/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { useEffect, useState } from "react";
import { Room, RoomEvent, RoomStateEvent } from "matrix-js-sdk/src/matrix";
import { Text } from "@vector-im/compound-web";
import { Icon as UsersIcon } from "@vector-im/compound-design-tokens/icons/users.svg";
import { Icon as MessageIcon } from "@vector-im/compound-design-tokens/icons/message.svg";

import { Flex } from "../../utils/Flex";

interface Props {
    room: Room;
}

const RoomSummaryQuickStats: React.FC<Props> = ({ room }) => {
    const [memberCount, setMemberCount] = useState<number>(0);
    const [messageCount, setMessageCount] = useState<number>(0);

    useEffect(() => {
        const updateMemberCount = (): void => {
            setMemberCount(room.getJoinedMemberCount());
        };

        const updateMessageCount = (): void => {
            const timeline = room.getLiveTimeline();
            setMessageCount(timeline.getEvents().length);
        };

        // Initial update
        updateMemberCount();
        updateMessageCount();

        // Set up listeners
        room.on(RoomStateEvent.Members, updateMemberCount);
        room.on(RoomEvent.Timeline, updateMessageCount);

        // Cleanup
        return () => {
            room.removeListener(RoomStateEvent.Members, updateMemberCount);
            room.removeListener(RoomEvent.Timeline, updateMessageCount);
        };
    }, [room]);

    return (
        <Flex align="center" className="mx_RoomSummaryQuickStats">
            <Flex align="center" gap="var(--cpd-space-2x)">
                <UsersIcon width="20px" height="20px" />
                <Text size="sm" weight="semibold">
                    {memberCount} members
                </Text>
            </Flex>
            <Flex align="center" gap="var(--cpd-space-2x)">
                <MessageIcon width="20px" height="20px" />
                <Text size="sm" weight="semibold">
                    {messageCount} messages
                </Text>
            </Flex>
        </Flex>
    );
};

export default RoomSummaryQuickStats;