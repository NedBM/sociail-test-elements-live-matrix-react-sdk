/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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

import React from 'react';
import { MatrixClient } from 'matrix-js-sdk/src/matrix';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mocked } from 'jest-mock';

import { MatrixClientPeg } from '../../../../src/MatrixClientPeg';
import AddRemoveSkills from '../../../../src/components/views/settings/AddRemoveSkills';


jest.mock('../../../MatrixClientPeg', () => ({
    MatrixClientPeg: {
        get: jest.fn(),
    },
}));

describe('<AddRemoveSkills />', () => {
    let mockClient: jest.Mocked<Pick<MatrixClient, 'getSkills' | 'addSkill' | 'removeSkill'>>;

    beforeEach(() => {
        mockClient = {
            getSkills: jest.fn().mockResolvedValue([
                { id: '1', name: 'JavaScript' },
                { id: '2', name: 'React' },
            ]),
            addSkill: jest.fn(),
            removeSkill: jest.fn(),
        };

        mocked(MatrixClientPeg.get).mockReturnValue(mockClient as unknown as MatrixClient);
    });

    it('renders existing skills', async () => {
        const { asFragment } = render(<AddRemoveSkills />);
        
        await waitFor(() => {
            expect(screen.getByText('JavaScript')).toBeInTheDocument();
            expect(screen.getByText('React')).toBeInTheDocument();
        });

        expect(asFragment()).toMatchSnapshot();
    });

    it('adds a new skill', async () => {
        const newSkill = 'TypeScript';
        mockClient.addSkill.mockResolvedValue([
            { id: '1', name: 'JavaScript' },
            { id: '2', name: 'React' },
            { id: '3', name: newSkill },
        ]);

        render(<AddRemoveSkills />);

        await waitFor(() => {
            expect(screen.getByLabelText('Skill')).toBeInTheDocument();
        });

        await act(async () => {
            await userEvent.type(screen.getByLabelText('Skill'), newSkill);
            await userEvent.click(screen.getByText('Add'));
        });

        await waitFor(() => {
            expect(mockClient.addSkill).toHaveBeenCalledWith(newSkill);
            expect(screen.getByText(newSkill)).toBeInTheDocument();
        });
    });

    it('removes an existing skill', async () => {
        mockClient.removeSkill.mockResolvedValue([
            { id: '2', name: 'React' },
        ]);

        render(<AddRemoveSkills />);

        await waitFor(() => {
            expect(screen.getByText('JavaScript')).toBeInTheDocument();
        });

        await act(async () => {
            await userEvent.click(screen.getAllByText('Remove')[0]);
        });

        await waitFor(() => {
            expect(mockClient.removeSkill).toHaveBeenCalledWith('1');
            expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
            expect(screen.getByText('React')).toBeInTheDocument();
        });
    });

    it('disables inputs when disabled prop is true', async () => {
        render(<AddRemoveSkills disabled={true} />);

        await waitFor(() => {
            expect(screen.getByLabelText('Skill')).toBeDisabled();
            expect(screen.getByText('Add')).toBeDisabled();
            expect(screen.getAllByText('Remove')[0]).toBeDisabled();
        });
    });
});