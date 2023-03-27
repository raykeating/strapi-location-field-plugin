import React from "react";
import styled from "styled-components";
import { Icon } from "@strapi/design-system/Icon";
import { Flex } from "@strapi/design-system/Flex";
import { PinMap } from "@strapi/icons";

const IconBox = styled(Flex)`
    background-color: #f0f0ff;
    border: 1px solid #d9d8ff;
    svg > path {
        fill: #4285f4;
    }
`;

const MapPickerIcon = () => {
    return (
        <IconBox justifyContent="center" alignItems="center" width={7} height={6} hasRadius aria-hidden>
            <Icon as={PinMap} />
        </IconBox>
    );
};

export default MapPickerIcon;
