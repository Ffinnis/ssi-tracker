CREATE TABLE IF NOT EXISTS ssi_scores (
    id SERIAL PRIMARY KEY,
    ssi_overall_score FLOAT NOT NULL,
    establish_your_professional_brand FLOAT NOT NULL,
    find_the_right_people FLOAT NOT NULL,
    engage_with_insights FLOAT NOT NULL,
    build_relationships FLOAT NOT NULL,
    date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);