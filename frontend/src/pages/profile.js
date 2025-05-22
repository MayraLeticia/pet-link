"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../services/api';
import { deletarPet } from '../services/api';
import { Menu, PetRegister } from "../components";

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);

  // Estados para edição
  const [editingUser, setEditingUser] = useState(false);
  const [editingPet, setEditingPet] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmDeletePet, setConfirmDeletePet] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);

  const [userForm, setUserForm] = useState({
    username: '',
    email: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [petForm, setPetForm] = useState({
    name: '',
    age: '',
    species: '',
    height: '',
    breed: '',
    weight: '',
    description: ''
  });

  // Função para atualizar dados do usuário
  const updateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user?._id) return;

      const response = await api.patch(`/user/${user._id}`, userForm, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUser(response.data);
      setEditingUser(false);
      alert('Dados do usuário atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar dados do usuário');
    }
  };

  // Função para atualizar dados do pet
  const updatePet = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !selectedPet?._id) return;

      const response = await api.patch(`/pet/${selectedPet._id}`, petForm, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Atualiza o pet na lista
      const updatedPets = pets.map(pet =>
        pet._id === selectedPet._id ? response.data : pet
      );

      setPets(updatedPets);
      setSelectedPet(response.data);
      setEditingPet(false);
      alert('Dados do pet atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar pet:', error);
      alert('Erro ao atualizar dados do pet');
    }
  };

  // Função para iniciar edição do usuário
  const startEditingUser = () => {
    setUserForm({
      username: user?.username || '',
      email: user?.email || ''
    });
    setEditingUser(true);
  };

  // Função para iniciar edição do pet
  const startEditingPet = () => {
    setPetForm({
      name: selectedPet?.name || '',
      age: selectedPet?.age || '',
      species: selectedPet?.species || '',
      height: selectedPet?.height || '',
      breed: selectedPet?.breed || '',
      weight: selectedPet?.weight || '',
      description: selectedPet?.description || ''
    });
    setEditingPet(true);
  };

  // Função para cancelar edição
  const cancelEdit = (type) => {
    if (type === 'user') {
      setEditingUser(false);
    } else if (type === 'pet') {
      setEditingPet(false);
    }
  };

  // Handlers para mudanças nos formulários
  const handleUserChange = (e) => {
    setUserForm({
      ...userForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePetChange = (e) => {
    setPetForm({
      ...petForm,
      [e.target.name]: e.target.value
    });
  };

  // Função para lidar com mudanças no formulário de senha
  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  // Função para mudar a senha
  const changePassword = async () => {
    try {
      // Validar se as senhas coincidem
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('As senhas não coincidem');
        return;
      }

      // Validar tamanho mínimo da senha
      if (passwordForm.newPassword.length < 6) {
        alert('A nova senha deve ter pelo menos 6 caracteres');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token || !user?._id) return;

      // Enviar requisição para alterar a senha
      await api.post('/api/auth/change-password', {
        userId: user._id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      alert('Senha alterada com sucesso!');
      setShowPasswordModal(false);

      // Limpar o formulário
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert(error.response?.data?.message || 'Erro ao alterar senha');
    }
  };

  // Função para excluir pet
  const deletePet = async () => {
    try {
      if (!selectedPet?._id) {
        alert('Nenhum pet selecionado');
        return;
      }

      // Confirmar exclusão
      if (!confirmDeletePet) {
        setConfirmDeletePet(true);
        return;
      }

      // Enviar requisição para excluir o pet usando a função importada
      await deletarPet(selectedPet._id);

      // Atualizar a lista de pets
      const updatedPets = pets.filter(pet => pet._id !== selectedPet._id);
      setPets(updatedPets);
      setSelectedPet(null);
      setConfirmDeletePet(false);

      alert('Pet excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir pet:', error);
      alert('Erro ao excluir pet');
      setConfirmDeletePet(false);
    }
  };

  // Função para excluir conta do usuário
  const deleteAccount = async () => {
    try {
      if (!user?._id) return;

      const token = localStorage.getItem('token');
      if (!token) return;

      // Confirmar exclusão
      if (!confirmDeleteAccount) {
        setConfirmDeleteAccount(true);
        return;
      }

      // Enviar requisição para excluir a conta
      await api.delete(`/api/user/${user._id}`);

      // Limpar o localStorage e redirecionar para a página de login
      localStorage.removeItem('token');
      router.push('/login');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      alert('Erro ao excluir conta');
      setConfirmDeleteAccount(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Token recuperado:", token);

    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const userId = JSON.parse(atob(token.split(".")[1])).sub;

        // Enviar o token no cabeçalho Authorization
        const userResponse = await api.get(`/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`  // Cabeçalho com token
          }
        });

        setUser(userResponse.data);

        if (userResponse.data.yourAnimal && userResponse.data.yourAnimal.length > 0) {
          console.log("Dados de yourAnimal:", userResponse.data.yourAnimal);

          const petResponses = await Promise.all(
            userResponse.data.yourAnimal.map(async (pet) => {
              console.log("Pet ID:", pet);  // Verifique aqui qual valor está sendo impresso
              if (pet) {
                return api.get(`/pet/${pet}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  }
                });
              }
              return null; // Se não houver pet.id, retorna null
            })
          );

          setPets(petResponses.filter((res) => res !== null).map((res) => res.data));
        }

      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        alert("Erro ao carregar dados");
        router.push("/login");
      }
    };

    fetchUserData();
  }, [router]);

  return (
    <div className="w-full h-full flex flex-row relative overflow-hidden profile-container">
      <Menu />

      {/* Modal de alteração de senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Alterar Senha</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Senha Atual</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded-lg"
                placeholder="Digite sua senha atual"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nova Senha</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded-lg"
                placeholder="Digite a nova senha"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Confirmar Nova Senha</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded-lg"
                placeholder="Confirme a nova senha"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={changePassword}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col justify-start items-start gap-4 mx-auto px-6 py-4 w-full max-w-[1000px] profile-content overflow-x-hidden">
        {/* Cabeçalho */}
        <div className="w-full md:w-auto relative profile-header">
          <p className="text-xl md:text-2xl font-medium text-left text-[#4d87fc] profile-title">Your profile</p>
          <p className="w-full md:w-auto text-sm font-medium text-left mt-2 profile-welcome">
            <span className="text-black">Welcome, </span>
            <span className="text-[#ffa2df]">{user?.username || "user"}</span>
            <span className="text-black">!</span>
          </p>
        </div>

        {/* Dados do Tutor + Dados do Pet */}
        <div className="flex flex-col md:flex-row justify-start items-start gap-3 md:gap-5 w-full profile-section">
          {/* Dados do Tutor */}
          <div className="flex flex-col justify-start items-start w-full md:w-auto md:flex-grow gap-4 md:gap-5 profile-tutor-data">
            <div className="flex justify-between items-center w-full">
              <p className="text-lg md:text-xl font-medium text-black">Dados do Tutor</p>
              {!editingUser ? (
                <button
                  onClick={startEditingUser}
                  className="text-sm text-[#4d87fc] hover:underline"
                >
                  Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={updateUser}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => cancelEdit('user')}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3 w-full">
              <div className="w-full md:w-[300px] lg:w-[350px] h-10 md:h-12 p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] border border-[#c7cedd] profile-form-field">
                {!editingUser ? (
                  <p className="text-sm md:text-base font-light text-[#383434]">
                    Nome: {user?.username || "Carregando..."}
                  </p>
                ) : (
                  <input
                    type="text"
                    name="username"
                    value={userForm.username}
                    onChange={handleUserChange}
                    placeholder="Nome"
                    className="w-full h-full bg-transparent outline-none text-sm md:text-base font-light text-gray-950"
                  />
                )}
              </div>
              <div className="w-full md:w-[300px] lg:w-[350px] h-10 md:h-12 p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                {!editingUser ? (
                  <p className="text-sm md:text-base font-light text-[#383434]">
                    E-mail: {user?.email || "Carregando..."}
                  </p>
                ) : (
                  <input
                    type="email"
                    name="email"
                    value={userForm.email}
                    onChange={handleUserChange}
                    placeholder="E-mail"
                    className="w-full h-full bg-transparent outline-none text-sm md:text-base font-light text-gray-950"
                  />
                )}
              </div>
              <div className="w-full md:w-[300px] lg:w-[350px] h-10 md:h-12 p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                {!editingUser ? (
                  <p className="text-sm md:text-base font-light text-[#383434]">
                    Repetir e-mail: {user?.email || "Carregando..."}
                  </p>
                ) : (
                  <input
                    type="email"
                    name="confirmEmail"
                    value={userForm.email}
                    onChange={handleUserChange}
                    placeholder="Confirmar E-mail"
                    className="w-full h-full bg-transparent outline-none text-sm md:text-base font-light text-gray-950"
                  />
                )}
               </div>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full profile-buttons">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full md:w-[150px] lg:w-[170px] h-10 md:h-12 px-3 md:px-4 rounded-[15px] bg-[#fee8fb] flex items-center justify-center cursor-pointer profile-button"
                >
                  <p className="text-sm md:text-base font-medium text-[#383434]">Mudar senha</p>
                </button>
                <button
                  onClick={deletePet}
                  className="w-full md:w-[150px] lg:w-[170px] h-10 md:h-12 px-3 md:px-4 rounded-[15px] bg-[#fee8fb] flex items-center justify-center cursor-pointer profile-button"
                >
                  <p className="text-sm md:text-base font-medium text-[#383434]">
                    {confirmDeletePet
                      ? "Confirmar exclusão"
                      : selectedPet
                        ? `Excluir ${selectedPet.name}`
                        : "Excluir pet"}
                  </p>
                </button>
              </div>
              <button
                onClick={deleteAccount}
                className="w-full h-10 md:h-12 p-2 md:p-3 rounded-[15px] bg-[#f2d3d3] border border-[#ff1010] border-dashed flex items-center justify-center cursor-pointer profile-button"
              >
                <p className="text-sm md:text-base font-semibold text-[#f00]">
                  {confirmDeleteAccount ? "Confirmar exclusão da conta" : "Excluir conta"}
                </p>
              </button>
            </div>
          </div>

          {/* Dados do Pet (com ou sem seleção) */}
          <div className="flex flex-col justify-start items-start gap-4 md:gap-6 w-full profile-pet-data">
            <div className="flex justify-between items-center w-full">
              <p className="text-lg md:text-xl font-medium text-left text-black">
                Dados do {selectedPet ? selectedPet.name : "<pet selecionado>"}
              </p>
              {selectedPet && !editingPet ? (
                <button
                  onClick={startEditingPet}
                  className="text-sm text-[#4d87fc] hover:underline"
                >
                  Editar
                </button>
              ) : selectedPet && editingPet ? (
                <div className="flex gap-2">
                  <button
                    onClick={updatePet}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => cancelEdit('pet')}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              ) : null}
            </div>
            <div className="flex flex-row w-full gap-4 md:gap-6 pet-data-container">
              <div className="flex flex-col gap-3 w-full">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="w-full sm:w-1/2 md:w-[120px] h-10 md:h-12 p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                    {!editingPet ? (
                      <p className="text-sm md:text-base font-light text-[#383434]">
                        {selectedPet?.name || "Nome"}
                      </p>
                    ) : (
                      <input
                        type="text"
                        name="name"
                        value={petForm.name}
                        onChange={handlePetChange}
                        placeholder="Nome"
                        className="w-full h-full bg-transparent outline-none text-sm md:text-base font-light text-[#383434]"
                      />
                    )}
                  </div>
                  <div className="w-full sm:w-1/2 md:w-[120px] h-10 md:h-12 p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                    {!editingPet ? (
                      <p className="text-sm md:text-base font-light text-[#383434]">
                        {selectedPet?.age || "Idade"}
                      </p>
                    ) : (
                      <input
                        type="text"
                        name="age"
                        value={petForm.age}
                        onChange={handlePetChange}
                        placeholder="Idade"
                        className="w-full h-full bg-transparent outline-none text-sm md:text-base font-light text-[#383434]"
                      />
                    )}
                  </div>
                </div>
                <div className="h-10 md:h-12 w-full md:w-[250px] p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                  {!editingPet ? (
                    <p className="text-sm md:text-base font-light text-[#383434]">
                      {selectedPet?.species || "Espécie"}
                    </p>
                  ) : (
                    <input
                      type="text"
                      name="species"
                      value={petForm.species}
                      onChange={handlePetChange}
                      placeholder="Espécie"
                      className="w-full h-full bg-transparent outline-none text-sm md:text-base font-light text-[#383434]"
                    />
                  )}
                </div>
                <div className="h-10 md:h-12 w-full p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                  {!editingPet ? (
                    <p className="text-sm md:text-base font-light text-[#383434]">
                      {selectedPet?.height || "Porte"}
                    </p>
                  ) : (
                    <input
                      type="text"
                      name="height"
                      value={petForm.height}
                      onChange={handlePetChange}
                      placeholder="Porte"
                      className="w-full h-full bg-transparent outline-none text-sm md:text-base font-light text-[#383434]"
                    />
                  )}
                </div>
                <div className="h-10 md:h-12 w-full p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                  {!editingPet ? (
                    <p className="text-sm md:text-base font-light text-[#383434]">
                      {selectedPet?.breed || "Raça"}
                    </p>
                  ) : (
                    <input
                      type="text"
                      name="breed"
                      value={petForm.breed}
                      onChange={handlePetChange}
                      placeholder="Raça"
                      className="w-full h-full bg-transparent outline-none text-sm md:text-base font-light text-[#383434]"
                    />
                  )}
                </div>
                <div className="h-10 md:h-12 w-full p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                  {!editingPet ? (
                    <p className="text-sm md:text-base font-light text-[#383434]">
                      {selectedPet?.weight ? `${selectedPet.weight} kg` : "Peso"}
                    </p>
                  ) : (
                    <input
                      type="text"
                      name="weight"
                      value={petForm.weight}
                      onChange={handlePetChange}
                      placeholder="Peso"
                      className="w-full h-full bg-transparent outline-none text-sm md:text-base font-light text-[#383434]"
                    />
                  )}
                </div>
              </div>
              <div className="min-h-[150px] h-auto w-full lg:w-[300px] p-2 md:p-3 rounded-xl bg-[#e8f0fe] overflow-y-auto profile-form-field description-field">
                {!editingPet ? (
                  <p className="text-sm md:text-base font-light text-[#383434]">
                    {selectedPet?.description || "Descrição do pet. Este campo permite que você adicione informações detalhadas sobre o seu animal de estimação, como personalidade, hábitos, necessidades especiais e outras características importantes."}
                  </p>
                ) : (
                  <textarea
                    name="description"
                    value={petForm.description}
                    onChange={handlePetChange}
                    placeholder="Descrição do pet"
                    className="w-full h-full min-h-[150px] bg-transparent outline-none text-sm md:text-base font-light text-[#383434] resize-none"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Galeria */}
        {pets.length > 0 && (
          <div className="mb-6">
            <p className="text-lg font-medium text-black mb-3">Galeria «{selectedPet ? selectedPet.name : "pet selecionado"}»</p>
            <div className="flex flex-wrap gap-4 w-full">
              {pets.map((pet, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedPet(pet);
                    setEditingPet(false);
                  }}
                  className={`w-[120px] h-[120px] rounded-[15px] bg-[#e8f0fe] overflow-hidden cursor-pointer border-2 ${
                    selectedPet?._id === pet._id
                      ? "border-[#4d87fc]"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={pet.imgAnimal?.[0]?.url || "/placeholder.jpg"}
                    alt={pet.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
              <div className="w-[120px] h-[120px] rounded-[15px] bg-[#e8f0fe]/30 border-2 border-[#646464] border-dashed flex items-center justify-center cursor-pointer">
                <p className="text-2xl font-light text-black">+</p>
              </div>
            </div>
          </div>
        )}
        <div className="w-full">
          <PetRegister/>
        </div>
      </div>
    </div>
  );
};

export default Profile;