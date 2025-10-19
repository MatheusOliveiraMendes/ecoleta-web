import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiArrowLeft, FiCheckCircle, FiX } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import api from '../../services/api';


import './styles.css';

import logo from '../../assets/logo.svg';
import batteries from '../../assets/batteries.svg';
import cookingOil from '../../assets/cooking-oil.svg';
import electronics from '../../assets/electronics.svg';
import lamps from '../../assets/lamps.svg';
import organic from '../../assets/organic.svg';
import paperCardboard from '../../assets/paper-cardboard.svg';


interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
}

const defaultCenter: [number, number] = [-12.68704, -54.58977];

const itemImageMapById: Record<number, string> = {
    1: lamps,
    2: batteries,
    3: paperCardboard,
    4: electronics,
    5: organic,
    6: cookingOil,
};

const itemImageMapBySlug: Record<string, string> = {
    lampadas: lamps,
    pilhasebaterias: batteries,
    papeisepapelao: paperCardboard,
    residuoseletronicos: electronics,
    residuosorganicos: organic,
    oleodecozinha: cookingOil,
};

const normalizeTitle = (title: string) =>
    title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

const ActiveLocationMarker = ({ position, visible }: { position: [number, number]; visible: boolean }) => {
    const map = useMap();

    useEffect(() => {
        if (!visible) {
            return;
        }

        if (position[0] !== 0 && position[1] !== 0) {
            const nextZoom = map.getZoom() < 12 ? 14 : map.getZoom();
            map.flyTo(position, nextZoom, { duration: 1.2 });
        }
    }, [map, position, visible]);

    if (!visible || (position[0] === 0 && position[1] === 0)) {
        return null;
    }

    return (
        <Marker position={position}>
            <Popup>Your location.</Popup>
        </Marker>
    );
};

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const [hasUserPosition, setHasUserPosition] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalVariant, setModalVariant] = useState<'success' | 'error'>('success');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;

                setInitialPosition([latitude, longitude]);
                setHasUserPosition(true);
            },
            () => {
                setInitialPosition(defaultCenter);
                setHasUserPosition(false);
            },
            {
                maximumAge: 1000 * 60 * 5,
                timeout: 10_000,
            }
        );
    }, []);

    useEffect(() => {
        api.get<Item[]>('items').then(({ data }) => {
            const formattedItems = data.map(item => {
                const normalizedTitle = normalizeTitle(item.title);
                const localImage =
                    itemImageMapById[item.id] ?? itemImageMapBySlug[normalizedTitle];

                return {
                    ...item,
                    image_url: localImage ?? item.image_url,
                };
            });

            setItems(formattedItems);
        });
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
            const ufInitials = res.data.map(uf => uf.sigla);

            setUfs(ufInitials);
        });
    }, []);

    useEffect(() => {
        if (selectedUf === '0') {
            return;
        }
        axios
            .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(res => {
                const cityNames = res.data.map(city => city.nome);

                setCities(cityNames);
            });
    }, [selectedUf])


    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;

        setSelectedUf(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;

        setSelectedCity(city);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {

        const { name, value } = event.target;

        setFormData({ ...formData, [name]: value })
    }

    function handleSelectItem(id: number) {

        const alreadySelected = selectedItems.findIndex(item => item === id);

        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id);

            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = initialPosition;
        const items = selectedItems;

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        };

        try {
            setIsSubmitting(true);
            await api.post('points', data);

            setModalVariant('success');
            setIsModalOpen(true);
            setFormData({ name: '', email: '', whatsapp: '' });
            setSelectedItems([]);
            setSelectedUf('0');
            setSelectedCity('0');
        } catch (error) {
            console.error('Erro ao criar ponto de coleta', error);
            setModalVariant('error');
            setIsModalOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isModalOpen]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalVariant('success');
    };

    const handleGoHome = () => {
        setIsModalOpen(false);
        navigate('/');
    };
    const hasLocation = hasUserPosition && !(initialPosition[0] === 0 && initialPosition[1] === 0);
    const mapCenter: [number, number] = hasLocation ? initialPosition : defaultCenter;
    const mapZoom = hasLocation ? 15 : 4;
    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />

                <Link to="/">
                    <FiArrowLeft />
                    Back to home
                </Link>
            </header>

            <div className="page-body">
                <section className="intro-panel">
                    <span className="eyebrow">New partner onboarding</span>
                    <h1>Register a collection point</h1>
                    <p>
                        Provide your entity details, choose the exact location on the map and select
                        the items your point collects. In less than five minutes you will be ready to
                        receive deliveries.
                    </p>

                    <ul className="steps-list">
                        <li>
                            <FiCheckCircle />
                            <span>Keep contact information up to date for residents.</span>
                        </li>
                        <li>
                            <FiCheckCircle />
                            <span>Mark the pin precisely on the map for accurate navigation.</span>
                        </li>
                        <li>
                            <FiCheckCircle />
                            <span>Select all recyclable materials accepted by your team.</span>
                        </li>
                    </ul>
                </section>

                <form onSubmit={handleSubmit}>
                    <fieldset>
                        <legend>
                            <h2>Data</h2>
                        </legend>

                        <div className="field">
                            <label htmlFor="name">Entity Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                placeholder="Collecta Recycling Co."
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="field-group">
                            <div className="field">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    placeholder="contato@ecoleta.com"
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="whatsapp">Whatsapp</label>
                                <input
                                    type="text"
                                    name="whatsapp"
                                    id="whatsapp"
                                    placeholder="+55 (11) 99999-9999"
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>
                            <div>
                                <h2>Address</h2>
                                <span>Select the address on the map</span>
                            </div>
                        </legend>

                        <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom>
                            <TileLayer
                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <ActiveLocationMarker position={initialPosition} visible={hasLocation} />
                        </MapContainer>

                        <div className="field-group">
                            <div className="field select-field">
                                <label htmlFor="uf">State</label>
                                <select
                                    name="uf"
                                    id="uf"
                                    value={selectedUf}
                                    onChange={handleSelectUf}
                                >
                                    <option value="0">Select a State</option>
                                    {ufs.map(uf => (
                                        <option key={uf} value={uf}>
                                            {uf}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="field select-field">
                                <label htmlFor="city">City</label>
                                <select
                                    name="city"
                                    id="city"
                                    value={selectedCity}
                                    onChange={handleSelectCity}
                                >
                                    <option value="0">Select a City</option>
                                    {cities.map(city => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>
                            <div>
                                <h2>Collection items</h2>
                                <span>Select one or more items below</span>
                            </div>
                        </legend>

                        <ul className="items-grid">
                            {items.map(item => (
                                <li
                                    key={item.id}
                                    onClick={() => handleSelectItem(item.id)}
                                    className={selectedItems.includes(item.id) ? 'selected' : ''}
                                >
                                    <img src={item.image_url} alt={item.title} />
                                    <span>{item.title}</span>
                                </li>
                            ))}
                        </ul>
                    </fieldset>

                    <div className="form-footer">
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Registering...' : 'Register collection point'}
                        </button>
                        <span>We will review submissions within 2 business days.</span>
                    </div>
                </form>
            </div>
            {isModalOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-content">
                        <button
                            type="button"
                            aria-label="Close success modal"
                            className="modal-close"
                            onClick={handleCloseModal}
                        >
                            <FiX />
                        </button>
                        <div className={`modal-icon ${modalVariant}`}>
                            {modalVariant === 'success' ? <FiCheckCircle /> : <FiAlertTriangle />}
                        </div>
                        {modalVariant === 'success' ? (
                            <>
                                <h2>Collection point registered!</h2>
                                <p>
                                    Your submission has been received. We will review the information and make the
                                    location available to residents shortly.
                                </p>
                                <div className="modal-actions row">
                                    <button type="button" className="secondary" onClick={handleCloseModal}>
                                        Register another point
                                    </button>
                                    <button type="button" onClick={handleGoHome}>
                                        Go to home
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2>We ran into an issue</h2>
                                <p>
                                    Something went wrong while saving the collection point. Please verify your data or
                                    try again in a few moments.
                                </p>
                                <div className="modal-actions single">
                                    <button type="button" onClick={handleCloseModal}>
                                        Dismiss and retry
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePoint;
