// src/components/Space.tsx

import React from 'react';
import { Platform, View } from 'react-native';

type SpaceProps = {
    height?: number;
    width?: number;
};

const Space: React.FC<SpaceProps> = ({ height = 45, width = 0 }) => {
    return Platform.OS === 'android' ? (
        <View style={{ height, width }} />
    ) : null;
    
};

export default Space;
