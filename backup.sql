--
-- PostgreSQL database dump
--

\restrict nyEon172fr0MYKi1kWA4Ovi7sceOedupzW3ONEYpoF61hNw0t9XHhFubGBFJB3x

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: dispensers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispensers (
    id integer NOT NULL,
    latitude numeric NOT NULL,
    longitude numeric NOT NULL,
    location_description text,
    is_paid boolean DEFAULT false,
    price numeric DEFAULT 0,
    added_by_user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dispensers OWNER TO postgres;

--
-- Name: dispensers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dispensers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dispensers_id_seq OWNER TO postgres;

--
-- Name: dispensers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dispensers_id_seq OWNED BY public.dispensers.id;


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ratings (
    id integer NOT NULL,
    dispenser_id integer,
    user_id integer,
    cleanliness_score integer,
    review_text text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ratings_cleanliness_score_check CHECK (((cleanliness_score >= 1) AND (cleanliness_score <= 5)))
);


ALTER TABLE public.ratings OWNER TO postgres;

--
-- Name: ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ratings_id_seq OWNER TO postgres;

--
-- Name: ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ratings_id_seq OWNED BY public.ratings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    join_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: dispensers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispensers ALTER COLUMN id SET DEFAULT nextval('public.dispensers_id_seq'::regclass);


--
-- Name: ratings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings ALTER COLUMN id SET DEFAULT nextval('public.ratings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: dispensers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispensers (id, latitude, longitude, location_description, is_paid, price, added_by_user_id, created_at) FROM stdin;
1	40.7128	-74.0060	Central Park near the main entrance	f	0	1	2026-03-08 19:24:04.09342
2	40.7138	-74.0070	Inside the public library, 1st floor	f	0	2	2026-03-08 19:24:04.09342
3	40.7148	-74.0080	Subway station platform 2	t	1.50	3	2026-03-08 19:24:04.09342
4	40.7158	-74.0090	Community center gym	f	0	4	2026-03-08 19:24:04.09342
5	40.7168	-74.0100	Shopping mall food court	t	2.00	5	2026-03-08 19:24:04.09342
6	40.720976	-73.992395	test add dis	f	0	1	2026-03-08 19:29:07.067897
\.


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ratings (id, dispenser_id, user_id, cleanliness_score, review_text, created_at) FROM stdin;
1	1	2	5	Very clean and cold water!	2026-03-08 19:24:04.095142
2	2	3	4	Good, but sometimes has a line.	2026-03-08 19:24:04.095142
3	3	4	2	A bit dirty, needs maintenance.	2026-03-08 19:24:04.095142
4	4	5	5	Perfect, always working.	2026-03-08 19:24:04.095142
5	5	1	3	Average, water is not very cold.	2026-03-08 19:24:04.095142
6	6	1	3	good	2026-03-08 19:29:20.8174
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, join_date) FROM stdin;
1	water_lover99	2026-03-08 19:24:04.092177
2	hydro_homie	2026-03-08 19:24:04.092177
3	city_walker	2026-03-08 19:24:04.092177
4	eco_warrior	2026-03-08 19:24:04.092177
5	thirst_quencher	2026-03-08 19:24:04.092177
\.


--
-- Name: dispensers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dispensers_id_seq', 6, true);


--
-- Name: ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ratings_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: dispensers dispensers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispensers
    ADD CONSTRAINT dispensers_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: dispensers dispensers_added_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispensers
    ADD CONSTRAINT dispensers_added_by_user_id_fkey FOREIGN KEY (added_by_user_id) REFERENCES public.users(id);


--
-- Name: ratings ratings_dispenser_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_dispenser_id_fkey FOREIGN KEY (dispenser_id) REFERENCES public.dispensers(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict nyEon172fr0MYKi1kWA4Ovi7sceOedupzW3ONEYpoF61hNw0t9XHhFubGBFJB3x

