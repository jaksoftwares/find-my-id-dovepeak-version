-- Seed 15 IDs distributed across all categories
-- Categories: national_id, student_id, passport, atm_card, nhif, driving_license, other

INSERT INTO public.ids_found (
    id_type,
    full_name,
    registration_number,
    serial_number,
    faculty,
    year_of_study,
    location_found,
    holding_location,
    description,
    image_url,
    status,
    date_found,
    visibility
) VALUES
-- National IDs (2)
('national_id', 'John Kiprop Korir', NULL, '32456789', NULL, NULL, 'Gate A', 'Security Office', 'Found near the main gate entrance on a stone bench.', 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600', 'verified', CURRENT_DATE - INTERVAL '10 days', true),
('national_id', 'Jane Wanjiku Mwangi', NULL, '11223344', NULL, NULL, 'Student Center', 'Information Desk', 'Found on a table at the cafeteria during lunch break.', 'https://images.unsplash.com/photo-1557682224-5b8590cb30e9?q=80&w=600', 'verified', CURRENT_DATE - INTERVAL '5 days', true),

-- Student IDs (3)
('student_id', 'Alex Odhiambo Kamau', 'SIT/001/2021', 'A123789', 'SCIT', 'Year 3', 'Main Library', 'Librarian Desk', 'Found in the quiet study area on the first floor.', 'https://images.unsplash.com/photo-1544650030-3c9b1220f7e9?q=80&w=600', 'verified', CURRENT_DATE - INTERVAL '2 days', true),
('student_id', 'Beatrice Chebet', 'BCOM/055/2022', 'B456123', 'COBESS', 'Year 2', 'CLB 001', 'Admin Block Room 5', 'Left on a seat after a morning lecture.', 'https://images.unsplash.com/photo-1606180204781-807c4270f209?q=80&w=600', 'verified', CURRENT_DATE - INTERVAL '3 days', true),
('student_id', 'Charles Mutua', 'ENE/010/2020', 'C789555', 'COETEC', 'Year 4', 'Engineering Workshop', 'Security Post 3', 'Found near the mechanical workshop entrance.', 'https://images.unsplash.com/photo-1563013544-8411d35d8831?q=80&w=600', 'verified', CURRENT_DATE - INTERVAL '4 days', true),

-- Passports (2)
('passport', 'David Otieno Omondi', NULL, 'AK009876', NULL, NULL, 'Main Library Entrance', 'Security Locker', 'Kenyan passport found near the bag check area.', 'https://images.unsplash.com/photo-1544256718-3bda237fc333?q=80&w=600', 'verified', CURRENT_DATE - INTERVAL '15 days', true),
('passport', 'Esther Nyambura Kariuki', NULL, 'BK112233', NULL, NULL, 'Admin Building', 'Main Reception', 'Found in the corridor leading to the Registrar''s office.', 'https://images.unsplash.com/photo-1556742049-023b9f4717bb?q=80&w=600', 'verified', CURRENT_DATE - INTERVAL '8 days', true),

-- ATM Cards (2)
('atm_card', 'Francis Githinji Njoroge', NULL, '**** 4567', NULL, NULL, 'ABSA ATM Lobby', 'Security HQ', 'ABSA debit card found at the ATM lobby near the main bank branch.', 'https://images.unsplash.com/photo-1563013544-7ae76c6c5432?q=80&w=600', 'verified', CURRENT_DATE - INTERVAL '1 day', true),
('atm_card', 'Grace Njeri Kamau', NULL, '**** 1234', NULL, NULL, 'KCB ATM Student Center', 'Student Center Hub', 'KCB ATM card found near the juice parlor.', 'https://images.unsplash.com/photo-1613243555988-441166d0d8fd?q=80&w=600', 'verified', CURRENT_DATE - INTERVAL '2 days', true),

-- NHIF (2)
('nhif', 'Henry Kibet Ruto', NULL, 'NHIF-778899', NULL, NULL, 'University Health Clinic', 'Clinic Reception', 'NHIF card found at the waiting area chairs.', 'https://images.unsplash.com/photo-1633158829585-23dad8f605fd?q=80&w=600', 'verified', CURRENT_DATE - INTERVAL '6 days', true),
('nhif', 'Irene Chelangat', NULL, 'NHIF-445566', NULL, NULL, 'Science Complex Lab 2', 'Lab Technician Office', 'Found in the third floor chemistry lab.', 'https://images.unsplash.com/photo-1586282391129-76a6df230234?q=80&w=600', 'verified', CURRENT_DATE - INTERVAL '7 days', true),

-- Driving Licenses (2)
('driving_license', 'James Maina Mwangi', NULL, 'DL-990011', NULL, NULL, 'Sports Pavilion', 'pavilion Security Manager', 'Found at the sports pavilion during the intra-university games.', 'https://images.unsplash.com/photo-1627633224213-909d71c11e73?q=80&w=600', 'verified', CURRENT_DATE - INTERVAL '4 days', true),
('driving_license', 'Karen Naliaka Khaemba', NULL, 'DL-223344', NULL, NULL, 'Gate B Pedestrian Path', 'Gate B Guard Room', 'Dropped near the turnstiles at Gate B.', 'https://images.unsplash.com/photo-1590424744295-8854992564fd?q=80&w=600', 'verified', CURRENT_DATE - INTERVAL '9 days', true),

-- Other (2)
('other', 'Kevin Omondi', NULL, 'WORK-ID-556', NULL, NULL, 'Maintenance Block', 'Maintenance Office', 'Staff work ID for a construction company working on campus.', 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=600', 'verified', CURRENT_DATE - INTERVAL '12 days', true),
('other', 'Lucy Atieno', NULL, 'CERT-982', NULL, NULL, 'Dining Hall', 'Mess Manager Desk', 'Laminated health certificate found near the service counter.', 'https://images.unsplash.com/photo-1517245315133-78b173cc4d90?q=80&w=600', 'verified', CURRENT_DATE - INTERVAL '14 days', true);
