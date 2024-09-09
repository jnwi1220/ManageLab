import React, { useState } from 'react';
import { Modal, Form, Input, Checkbox, Steps } from 'antd';

const { Step } = Steps;

const CreateProjectModal = ({ open, onCancel, onCreate }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();

    // State variables to store form values from each step
    const [projectInfo, setProjectInfo] = useState({ name: '', description: '' });
    const [members, setMembers] = useState('');
    const [isManager, setIsManager] = useState(false);

    const steps = [
        {
            title: 'Project Info',
            content: (
                <>
                    <Form.Item
                        name="name"
                        label="Project Name"
                        rules={[{ required: true, message: 'Please enter the project name' }]}
                    >
                        <Input
                            placeholder="Enter project name"
                            onChange={(e) =>
                                setProjectInfo({ ...projectInfo, name: e.target.value })
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter the project description' }]}
                    >
                        <Input.TextArea
                            placeholder="Enter project description"
                            onChange={(e) =>
                                setProjectInfo({ ...projectInfo, description: e.target.value })
                            }
                        />
                    </Form.Item>
                    <Form.Item>
                        <Checkbox onChange={(e) => setIsManager(e.target.checked)}>
                            I am the manager
                        </Checkbox>
                    </Form.Item>
                </>
            ),
        },
        {
            title: 'Invite Members',
            content: (
                <Form.Item
                    name="members"
                    label="Invite Members (by username)"
                >
                    <Input
                        placeholder="Enter usernames separated by commas"
                        onChange={(e) => setMembers(e.target.value)}
                    />
                </Form.Item>
            ),
        }
    ];

    const handleNext = async () => {
        try {
            await form.validateFields(); // Validate current step fields
            setCurrentStep(currentStep + 1);
        } catch (error) {
            console.log('Validation Failed:', error);
        }
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleFinish = () => {
        const finalValues = {
            ...projectInfo,
            members,
            isManager
        };
        console.log('Final Form Values:', finalValues); // Log final form values
        onCreate(finalValues, isManager);
        form.resetFields();
        setCurrentStep(0);
        setProjectInfo({ name: '', description: '' });
        setMembers('');
    };

    return (
        <Modal
            open={open}
            title="Create a New Project"
            okText={currentStep === steps.length - 1 ? "Create" : "Next"}
            cancelText={currentStep === 0 ? "Cancel" : "Back"}
            onCancel={currentStep === 0 ? onCancel : handlePrev}
            onOk={currentStep === steps.length - 1 ? handleFinish : handleNext}
        >
            <Steps current={currentStep}>
                {steps.map((step, index) => (
                    <Step key={index} title={step.title} />
                ))}
            </Steps>
            <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
                {steps[currentStep].content}
            </Form>
        </Modal>
    );
};

export default CreateProjectModal;
