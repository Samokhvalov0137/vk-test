import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { repositoryStore } from "../store/repositoryStore";
import { Typography, List, Avatar, Button, Input, Modal, Select, Col, Row, message } from "antd";
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import InfiniteScroll from "react-infinite-scroll-component";

const RepositoryList: React.FC = observer(() => {
    const [editingRepo, setEditingRepo] = useState<{ id: number | null; name: string }>({ id: null, name: "" });
    const { Title } = Typography;


    useEffect(() => {
        repositoryStore.fetchRepositories();
    }, []);


    // функция удаления элемпента
    const handleDelete = (id: number) => {
        repositoryStore.removeRepository(id);
    };

    // функция изменения названия
    const handleEdit = (id: number, currentName: string) => {
        setEditingRepo({ id, name: currentName });
    };

    // функция сохранения нового названия
    const handleSave = () => {
        if (editingRepo.id !== null) {
            repositoryStore.editRepository(editingRepo.id, editingRepo.name);
            setEditingRepo({ id: null, name: "" });
        }
    };

    // функция сортировки репозиториев
    const handleSort = (value: string) => {
        repositoryStore.setSortBy(value as keyof typeof repositoryStore.repositories[0]);
    };

    // функция для добавления в избранное
    const handleAddFavorite = (id: number) => {
        repositoryStore.addFavorite(id);
        message.success('Добавлено в избранное');
    };

    // функция для удаления из избранного
    const handleRemoveFavorite = (id: number) => {
        repositoryStore.removeFavorite(id);
        message.error('Удалено из избранного');
    };

    return (
        <Row gutter={30}>
            <Col flex={4} >
                <Row gutter={50} justify="space-around" align="middle">
                    <Title level={2}>Список репозиториев</Title>
                    <Select
                        placeholder="Сортировать по"
                        style={{ width: 200 }}
                        onChange={handleSort}
                        options={[
                            { value: 'name', label: <span>Имя</span> },
                            { value: 'description', label: <span>Описание</span> },
                            { value: 'id', label: <span>ID</span> }
                        ]}
                    >
                    </Select>
                </Row>

                <InfiniteScroll
                    dataLength={repositoryStore.repositories.length}
                    next={() => repositoryStore.fetchRepositories()}
                    hasMore={!repositoryStore.loading}
                    loader={<h4>Загрузка...</h4>}
                >
                    <List
                        bordered
                        dataSource={repositoryStore.repositories}
                        renderItem={(repo) => (
                            <List.Item
                                data-id={repo.id}
                                actions={[
                                    <Button color="primary" variant="solid" onClick={() => handleEdit(repo.id, repo.name)}>Редактировать</Button>,
                                    <Button danger onClick={() => handleDelete(repo.id)}>Удалить</Button>,
                                    <Button shape="circle" onClick={() => repositoryStore.isFavorite(repo.id) ? handleRemoveFavorite(repo.id) : handleAddFavorite(repo.id)}>
                                        {repositoryStore.isFavorite(repo.id) ? <HeartFilled /> : <HeartOutlined />}
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar src={repo.owner.avatar_url} />}
                                    title={<a href={repo.html_url}>{repo.name}</a>}
                                    description={repo.description}
                                />
                            </List.Item>
                        )}
                    />
                </InfiniteScroll>

                <Modal
                    title="Изменить название репозитория"
                    visible={editingRepo.id !== null}
                    onOk={handleSave}
                    onCancel={() => setEditingRepo({ id: null, name: "" })}
                >
                    <Input
                        value={editingRepo.name}
                        onChange={(e) => setEditingRepo({ ...editingRepo, name: e.target.value })}
                    />
                </Modal>
            </Col>


            <Col flex={2} >
                <Title level={2}>Избранные репозитории</Title>
                <List
                    bordered
                    dataSource={repositoryStore.favoriteRepositories}
                    renderItem={(fav) => (
                        <List.Item key={fav.id}>
                            <a href={fav.html_url}>{fav.name}</a>
                            <Button shape="circle" onClick={() => handleRemoveFavorite(fav.id)}>
                                {repositoryStore.isFavorite(fav.id) ? <HeartFilled /> : <HeartOutlined />}
                            </Button>
                        </List.Item>
                    )}
                />
            </Col>
        </Row>
    );
});

export default RepositoryList;