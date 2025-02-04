import { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { lessonSchema } from '../../../constants/yupSchemas';
import FormItem from "../../../components/FormItem";
import { Alert, AlertTitle } from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../components/Button";
import { addLessonAction, getOneCourseAction } from "../../../service/api";
import { API } from "../../../constants/api";
import { Links } from "../../../constants/links";
import useAuthStore from "../../../context/authStore";
import AdminContent from "../AdminContent";
import Snackbar from "../Snackbar";

const AddLessonPage = () => {
    const [courseData, setCourseData] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [snackIsOpen, setSnackIsOpen] = useState(false);
    const { token } = useAuthStore((state) => ({ token: state.token }));
    const navigate = useNavigate();
    const { courseID } = useParams();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(lessonSchema),
    });
    const onSubmit = async(data, e) => {
        data.course = courseID

        setIsLoading(true);
        const addLessonData = await addLessonAction(data, token);
        setIsLoading(false)

        if(addLessonData.error) {
            setErrorMessage(addLessonData.error);
            return 
        }
        setSnackIsOpen(true);
        setErrorMessage(null);
        navigate(`${Links.admin.root}/${Links.admin.courses}/${courseID}/modulos/${data.module}`);
    }

    const fetchData = async() => {

        const data = await getOneCourseAction(courseID);

        if(data.error) {
            setErrorMessage(data.error)
            return 
        }
        return data.courseData
    }

    useEffect(() => {
        fetchData()
        .then(res => {
            setCourseData(res);
            console.log(res);
        })
        .catch(e => setErrorMessage('Erro ao obter dados'))
    },[])

    return ( 
        <AdminContent active='course'>
            <Title>Adicionar Aula</Title>
            <Form onSubmit={handleSubmit(onSubmit)}>
                {errorMessage && 
                    <Alert severity="error">
                        <AlertTitle>Erro</AlertTitle>
                        {errorMessage}
                    </Alert>
                }
                <FormItem
                    title="Título"
                    name="title"
                    errorMessage={errors.title?.message}
                    registerForm={register("title")}
                />
                <FormItem
                    title="Conteúdo"
                    name="content"
                    type="textarea"
                    errorMessage={errors.content?.message}
                    registerForm={register("content")}
                />
                <FormItem
                    title="Autor"
                    name="author"
                    errorMessage={errors.author?.message}
                    registerForm={register("author")}
                />
                <FormItem
                    title="Módulo"
                    name="module"
                    type="select"
                    placeholder="Escolha um módulo"
                    selectOptions={courseData?.course.modules.map(m => {return {title: m.title, value: m.code, id: m._id}})}
                    errorMessage={errors.module?.message}
                    registerForm={register("module")}
                />
                <FormItem
                    title="Tipo de conteúdo"
                    name="type"
                    type="select"
                    placeholder="Escolha um tipo"
                    selectOptions={API.lessonTypes.map(type => { return {title: type, value: type, id: type} })}
                    errorMessage={errors.type?.message}
                    registerForm={register("type")}
                />
                <FormItem
                    title="Duração da aula"
                    name="duration"
                    placeholder="00:00:00"
                    errorMessage={errors.duration?.message}
                    registerForm={register("duration")}
                />
                <ButtonContainer>
                    <Button 
                        title="Cancelar"
                        variant="gray"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(-1);
                        }}
                    />
                    <Button
                        title="Salvar"
                        disabled={isLoading}
                    />
                </ButtonContainer>
            </Form>
            <Snackbar
                isOpen={snackIsOpen}
                setIsOpen={setSnackIsOpen}
                type={'success'}
            />
        </AdminContent>
    );
}
 
export default AddLessonPage;

const Container = styled.div`
    padding: 1rem;
`
const Form = styled.form``
const ButtonContainer = styled.div`
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
    flex-direction: row;
    column-gap: 1rem;

    & Button {
        max-width: 15rem;
    }
`
const Title = styled.h1`
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
`