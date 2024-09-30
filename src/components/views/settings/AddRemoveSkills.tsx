/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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

import React, { useCallback, useEffect, useState } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { _t } from "../../../languageHandler";
import AccessibleButton from "../elements/AccessibleButton";
import Field from "../elements/Field";
import InlineSpinner from "../elements/InlineSpinner";
import { useMatrixClientContext } from "../../../contexts/MatrixClientContext";

interface Skill {
    id: string;
    name: string;
}

interface AddRemoveSkillsProps {
    disabled?: boolean;
}

const ExistingSkill: React.FC<{ skill: Skill; onRemove: (id: string) => void; disabled?: boolean }> = ({
    skill,
    onRemove,
    disabled,
}) => {
    return (
        <div className="mx_AddRemoveSkills_existing">
            <span className="mx_AddRemoveSkills_existing_name">{skill.name}</span>
            <AccessibleButton
                onClick={() => onRemove(skill.id)}
                kind="danger_sm"
                disabled={disabled}
            >
                {_t("action|remove")}
            </AccessibleButton>
        </div>
    );
};

const AddSkillSection: React.FC<{ disabled?: boolean; onAdd: (skillName: string) => void }> = ({
    disabled,
    onAdd,
}) => {
    const [newSkill, setNewSkill] = useState("");

    const onAddClick = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (newSkill.trim()) {
            onAdd(newSkill.trim());
            setNewSkill("");
        }
    }, [newSkill, onAdd]);

    return (
        <form onSubmit={onAddClick} autoComplete="off" noValidate={true}>
            <Field
                type="text"
                //need to add translator
                // label="settings|general|skill_label"
                label="Skills"
                value={newSkill}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSkill(e.target.value)}
                disabled={disabled}
            />
            <AccessibleButton onClick={onAddClick} kind="primary" disabled={disabled || !newSkill.trim()}>
                {_t("action|add")}
            </AccessibleButton>
        </form>
    );
};

export const AddRemoveSkills: React.FC<AddRemoveSkillsProps> = ({ disabled }) => {
    const client = useMatrixClientContext();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch skills when the component mounts
        client.getSkills().then(setSkills).catch(error => {
            logger.error("Failed to fetch skills", error);
        }).finally(() => {
            setIsLoading(false);
        });
    }, [client]);

    const addSkill = useCallback(async (skillName: string) => {
        try {
            const updatedSkills = await client.addSkill(skillName);
            setSkills(updatedSkills);
        } catch (error) {
            logger.error("Failed to add skill", error);
        }
    }, [client]);

    const removeSkill = useCallback(async (skillId: string) => {
        try {
            const updatedSkills = await client.removeSkill(skillId);
            setSkills(updatedSkills);
        } catch (error) {
            logger.error("Failed to remove skill", error);
        }
    }, [client]);

    if (isLoading) {
        return <InlineSpinner />;
    }

    return (
        <div className="mx_AddRemoveSkills">
            {/* <h3>"settings|general|skills_heading"</h3> */}
            <h3 style={{paddingTop: '10'}}>Skills</h3>
            {skills.map((skill) => (
                <ExistingSkill key={skill.id} skill={skill} onRemove={removeSkill} disabled={disabled} />
            ))}
            <AddSkillSection disabled={disabled} onAdd={addSkill} />
        </div>
    );
};

export default AddRemoveSkills;