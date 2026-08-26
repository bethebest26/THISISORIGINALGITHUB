-- Populate Courses
INSERT INTO courses (id, title, description, category) VALUES 
('c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', 'The Stoic Mindset', 'Master emotional control and resilience.', 'Mindset');

-- Populate Volumes
INSERT INTO course_volumes (id, course_id, title, volume_number) VALUES 
('v1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', 'c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', 'Foundations of Character', 1);

-- Populate Lessons (PM-B1)
INSERT INTO lessons (id, volume_id, title, trait_number, reading_time, difficulty, introduction, real_life_scenario, real_life_outcome) VALUES 
('pm-b1', 'v1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', 'Unshakeable Mental Armor', 1, '5 Minutes', 'Intermediate', 'Prepare to build your internal shield.', 'Amit presents to board.', 'Amit stays calm and commands respect.');

-- Add reading cards for pm-b1
INSERT INTO reading_cards (lesson_id, title, content, display_order) VALUES 
('pm-b1', 'Core Idea', 'Real confidence is about internal solidity.', 1),
('pm-b1', 'Deep Explanation', 'Mental armor is a series of cognitive filters.', 2);

-- Add MCQs for pm-b1
INSERT INTO mcqs (id, lesson_id, question, options, correct_answer, feedback) VALUES 
('pm-b1-q1', 'pm-b1', 'What is the primary indicator of authentic, unshakeable confidence?', 
ARRAY['Dominating conversations', 'A quiet internal solidity', 'Never experiencing fear', 'Surrounding oneself with agreeable people'], 
'A quiet internal solidity', 'Authentic confidence is silent.');
